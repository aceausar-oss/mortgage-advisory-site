import Anthropic from "@anthropic-ai/sdk";
import { chatSystemPrompt } from "@/lib/chat/prompt";
import { ChatRequest, MAX_BODY_BYTES, rateLimited, scrubPii } from "@/lib/chat/guard";
import { licensing } from "@/lib/site";

// AI assistant endpoint (CLAUDE.md §11). Server-only: the API key never reaches the browser.
// Streams plain text back to the chat window.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.CHAT_MODEL || "claude-opus-5";
const FALLBACK = `I'm having trouble answering right now. You can reach Ace directly at ${licensing.phone} or [book a call](/book).`;

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return text(`The chat assistant isn't set up yet. Please call us at ${licensing.phone} or [book a call](/book).`, 503);
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

  let scrubbed = false;
  const messages: Anthropic.Beta.BetaMessageParam[] = parsed.data.messages.map((m) => {
    if (m.role !== "user") return m;
    const s = scrubPii(m.content);
    scrubbed ||= s.removed;
    return { role: "user", content: s.text };
  });

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (s: string) => controller.enqueue(encoder.encode(s));
      try {
        if (scrubbed) {
          send("For your privacy, I removed a sensitive number from your message. Please don't share Social Security, account numbers, or birth dates here; Ace's team collects documents securely.\n\n");
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
          send(`\n\nI can't help with that one here, but Ace can. Call ${licensing.phone} or [book a call](/book).`);
        } else if (final.stop_reason === "max_tokens") {
          send("\n\n(That answer ran long. Ask me to continue, or book a call with an advisor for the full picture.)");
        }
      } catch (err) {
        if (err instanceof Anthropic.APIError) console.error("chat API error", err.status, err.message);
        else console.error("chat error", err);
        send(FALLBACK);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
