import { z } from "zod";
import { rateLimited } from "@/lib/chat/guard";
import { GUIDE_PDF } from "@/lib/guide";
import { siteUrl } from "@/lib/site";

// Guide sign-up: validates the email and hands the lead to Go High Level (Inbound Webhook workflow), which tags the
// contact and emails the guide. Server only; the webhook address never reaches the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  lang: z.enum(["en", "es"]).default("en"),
  page: z.string().max(200).default(""),
  website: z.string().max(200).optional(), // hidden field: real people leave it empty
});

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const ip = req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`guide:${ip}`)) return json({ error: "rate" }, 429);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "email" }, 400);
  const { email, lang, page, website } = parsed.data;
  const guide = `${siteUrl}${GUIDE_PDF[lang]}`;

  // Bots that fill the hidden field get a normal-looking answer and nothing is sent.
  if (website) return json({ ok: true, guide: GUIDE_PDF[lang] });

  const hook = process.env.GHL_GUIDE_WEBHOOK_URL;
  if (!hook) {
    console.info("guide sign-up not sent (GHL_GUIDE_WEBHOOK_URL not set):", { lang, page });
    return json({ ok: true, guide: GUIDE_PDF[lang], test: true });
  }

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        language: lang === "es" ? "Spanish" : "English",
        guide_url: guide,
        source: "Website: reverse mortgage guide",
        source_page: page ? `${siteUrl}${page.startsWith("/") ? page : ""}` : siteUrl,
        tags: ["reverse guide", "website lead", lang === "es" ? "spanish" : "english"],
        consent: "Agreed to receive emails from The Mortgage Advisory, Inc. (guide sign-up form)",
        submitted_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`webhook HTTP ${res.status}`);
  } catch (err) {
    // The visitor still gets the guide; the failure is logged in Vercel so the lead can be followed up.
    console.error("guide webhook failed", err instanceof Error ? err.message : err, { email, lang, page });
  }
  return json({ ok: true, guide: GUIDE_PDF[lang] });
}
