import Anthropic from "@anthropic-ai/sdk";
import { chatSystemPrompt } from "@/lib/chat/prompt";
import { ChatRequest, MAX_BODY_BYTES, rateLimited, scrubPii } from "@/lib/chat/guard";
import { licensing } from "@/lib/site";

// AI assistant endpoint (CLAUDE.md §11). Server-only: the API key never reaches the browser.
// Streams plain text back to the chat window.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.CHAT_MODEL || "claude-opus-5";
const FALLBACK = `I'm having trouble answering right now. You can reach our team at ${licensing.phone} or [book a call with an advisor](/book).`;
// Spanish versions of the notices the server writes itself (the AI answers in the visitor's language on its own).
const ES = {
  fallback: `No puedo responder en este momento. Puede comunicarse con nuestro equipo al ${licensing.phone} o [reservar una llamada](/es/book).`,
  scrubbed:
    "Por su privacidad, quité un número sensible de su mensaje. Por favor no comparta aquí números de Seguro Social, números de cuenta ni fechas de nacimiento; el equipo de Ace recibe los documentos de forma segura.\n\n",
  refusal: `\n\nNo puedo ayudarle con eso aquí, pero nuestro equipo sí. Llame al ${licensing.phone} o [reserve una llamada](/es/book).`,
  maxTokens: "\n\n(Esa respuesta salió larga. Pídame que continúe, o reserve una llamada con un asesor para ver el panorama completo).",
};

// Optional alert when the chat can't answer (Ace, Nov 2026): set CHAT_ALERT_WEBHOOK_URL to a Go High Level inbound
// webhook (or any URL that accepts JSON) to get a text/email. Sends only the error type, never the visitor's message,
// and at most once every 30 minutes per server instance so an outage doesn't flood the inbox.
let lastAlert = 0;
function alertChatDown(status: number | string, message: string) {
  const url = process.env.CHAT_ALERT_WEBHOOK_URL;
  if (!url || Date.now() - lastAlert < 30 * 60 * 1000) return;
  lastAlert = Date.now();
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "website_chat_down", status: String(status), error: message.slice(0, 300), time: new Date().toISOString() }),
  }).catch(() => {});
}

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    alertChatDown(503, "ANTHROPIC_API_KEY is not set");
    return text(`The chat assistant isn't set up yet. Please call us at ${licensing.phone} or [book a call with an advisor](/book).`, 503);
  }

  // On Vercel, x-real-ip is set by the platform (visitors can't spoof it); x-forwarded-for is the fallback elsewhere.
  const ip = req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return text(`You've sent a lot of messages in a short time. Please try again in a few minutes, or call us at ${licensing.phone}.`, 429);
  }

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return text("That message is too long. Please shorten it and try again.", 413);
  const raw = await req.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) return text("That message is too long. Please shorten it and try again.", 413);
  let payload: unknown = null;
  try {
    payload = JSON.parse(raw);
  } catch {}
  const parsed = ChatRequest.safeParse(payload);
  if (!parsed.success) return text("Sorry, I couldn't read that message. Please try again.", 400);
  const es = parsed.data.lang === "es";

  let scrubbed = false;
  const messages: Anthropic.Beta.BetaMessageParam[] = parsed.data.messages.map((m) => {
    if (m.role !== "user") return m;
    const s = scrubPii(m.content);
    scrubbed ||= s.removed;
    return { role: "user", content: s.text };
  });

  // Organization-level API keys (not tied to a workspace) need the workspace ID on every request.
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  const client = new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {});
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (s: string) => controller.enqueue(encoder.encode(s));
      try {
        if (scrubbed) {
          send(es ? ES.scrubbed : "For your privacy, I removed a sensitive number from your message. Please don't share Social Security, account numbers, or birth dates here; Ace's team collects documents securely.\n\n");
        }
        const stream = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 4000,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: "medium" },
          system: [{ type: "text", text: chatSystemPrompt(), cache_control: { type: "ephemeral" } }],
          messages,
        });
        stream.on("text", (delta) => send(delta));
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          send(es ? ES.refusal : `\n\nI can't help with that one here, but our team can. Call ${licensing.phone} or [book a call with an advisor](/book).`);
        } else if (final.stop_reason === "max_tokens") {
          send(es ? ES.maxTokens : "\n\n(That answer ran long. Ask me to continue, or book a call with an advisor for the full picture.)");
        }
      } catch (err) {
        if (err instanceof Anthropic.APIError) {
          console.error("chat API error", err.status, err.message);
          // Account or setup problems (bad key, workspace, billing, model) need Ace; brief overloads don't.
          if ([400, 401, 403, 404].includes(err.status ?? 0)) alertChatDown(err.status ?? "unknown", err.message);
        } else console.error("chat error", err);
        send(es ? ES.fallback : FALLBACK);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
