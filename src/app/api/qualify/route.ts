import { z } from "zod";
import { rateLimited } from "@/lib/chat/guard";
import {
  GOALS,
  LICENSED,
  answerLines,
  questionsFor,
  resultFor,
  type Answers,
} from "@/lib/qualify";
import { siteUrl } from "@/lib/site";

// "See what you qualify for" quiz lead (Ace, Oct 2026). Validates the contact and answers, re-runs the estimate on
// the server, and hands everything to Go High Level's Inbound Webhook (GHL_QUALIFY_WEBHOOK_URL), which creates the
// contact, tags it, and opens an opportunity in the Pre-Approval pipeline. Server only; the webhook never reaches the
// browser. No SSN, date of birth, account numbers, or property address are accepted (this is not a loan application).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const answerValue = z.union([
  z.string().trim().max(80),
  z.number().finite().min(0).max(100_000_000),
]);

const Body = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().max(60).default(""),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z
    .string()
    .trim()
    .max(25)
    .default("")
    .refine((p) => p === "" || p.replace(/\D/g, "").length >= 10, "phone"),
  smsConsent: z.boolean().default(false),
  lang: z.enum(["en", "es"]).default("en"),
  page: z.string().max(200).default(""),
  answers: z
    .record(z.string().max(40), answerValue)
    .refine((a) => Object.keys(a).length <= 30),
  website: z.string().max(200).optional(), // hidden field: real people leave it empty
});

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

const GOAL_LABEL = {
  buy: "Buy a home",
  refi: "Refinance",
  cash: "Cash from home (HELOC / cash-out)",
  reverse: "Reverse mortgage",
} as const;
const GOAL_TAG = {
  buy: "quiz: buy",
  refi: "quiz: refinance",
  cash: "quiz: heloc-cash",
  reverse: "quiz: reverse",
} as const;

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local";
  if (rateLimited(`qualify:${ip}`)) return json({ error: "rate" }, 429);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return json(
      {
        error:
          field === "phone"
            ? "phone"
            : field === "email"
              ? "email"
              : field === "firstName"
                ? "name"
                : "bad",
      },
      400,
    );
  }
  const { firstName, lastName, email, phone, smsConsent, lang, page, website } =
    parsed.data;
  const answers: Answers = parsed.data.answers;
  const goal = answers.goal as (typeof GOALS)[number];
  if (
    !GOALS.includes(goal) ||
    !LICENSED.includes(answers.state as (typeof LICENSED)[number])
  )
    return json({ error: "bad" }, 400);

  // Keep only answers to questions this path actually asks.
  const allowed = new Set(questionsFor(answers).map((q) => q.id));
  for (const k of Object.keys(answers)) if (!allowed.has(k)) delete answers[k];

  if (website) return json({ ok: true }); // bot: look normal, send nothing

  const result = resultFor(answers);
  const payload = {
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    // TCPA: texts only with this unchecked-by-default box ticked. Without it, the phone is for calls about the request.
    sms_consent: smsConsent ? "yes" : "no",
    sms_consent_text: smsConsent
      ? "Agreed to receive calls and text messages, including automated ones, from The Mortgage Advisory, Inc. about this request (website quiz). Consent is not a condition of service."
      : "",
    language: lang === "es" ? "Spanish" : "English",
    quiz_goal: GOAL_LABEL[goal],
    quiz_state: String(answers.state),
    quiz_city: String(answers.city ?? ""),
    quiz_timeline: String(answers.timeline ?? ""),
    quiz_credit: String(answers.credit ?? ""),
    quiz_estimate: result.figure
      ? `${result.figure.label.en}: ${result.figure.value}`
      : "",
    quiz_programs: result.programs.map((p) => p.name.en).join(", "),
    quiz_summary: result.summary,
    quiz_answers: answerLines(answers).join("\n"),
    booking_calendar: result.booking,
    pipeline: "Pre-Approval",
    source: "Website: qualify quiz",
    source_page: page.startsWith("/") ? `${siteUrl}${page}` : siteUrl,
    tags: [
      "pre-approval quiz",
      "website lead",
      GOAL_TAG[goal],
      lang === "es" ? "spanish" : "english",
      ...(smsConsent ? ["sms opt-in"] : []),
    ],
    submitted_at: new Date().toISOString(),
  };

  const hook = process.env.GHL_QUALIFY_WEBHOOK_URL;
  if (!hook) {
    console.info("qualify lead not sent (GHL_QUALIFY_WEBHOOK_URL not set):", {
      goal,
      state: answers.state,
      lang,
      est: payload.quiz_estimate,
    });
    return json({ ok: true, test: true });
  }
  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`webhook HTTP ${res.status}`);
  } catch (err) {
    // The visitor still sees their results; the failure is logged in Vercel so the lead can be followed up.
    console.error(
      "qualify webhook failed",
      err instanceof Error ? err.message : err,
      { email, goal, est: payload.quiz_estimate },
    );
  }
  return json({ ok: true });
}
