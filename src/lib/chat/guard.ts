import { z } from "zod";

// Request validation, PII scrubbing, and a simple abuse limiter for /api/chat.

export const MAX_MESSAGES = 20;
export const MAX_CHARS = 2000;

export const ChatRequest = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(MAX_CHARS * 4) }))
    .min(1)
    .max(MAX_MESSAGES)
    .refine((m) => m[0].role === "user" && m[m.length - 1].role === "user", "conversation must start and end with the user")
    .refine((m) => m.every((x, i) => i === 0 || x.role !== m[i - 1].role), "roles must alternate")
    .refine((m) => m.filter((x) => x.role === "user").every((x) => x.content.length <= MAX_CHARS), "message too long"),
});

// Sensitive numbers never leave the server (CLAUDE.md §11: no SSN, account numbers, or DOB in chat).
const PII_PATTERNS: [RegExp, string][] = [
  [/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, "[number removed for your privacy]"], // SSN-shaped
  [/\b(?:\d[ -]?){12,19}\b/g, "[number removed for your privacy]"], // card / account numbers
  [/\b(?:0?[1-9]|1[0-2])[/-](?:0?[1-9]|[12]\d|3[01])[/-](?:19|20)\d{2}\b/g, "[date removed for your privacy]"], // DOB-shaped dates
];

export function scrubPii(text: string): { text: string; removed: boolean } {
  let removed = false;
  let out = text;
  for (const [re, label] of PII_PATTERNS) {
    out = out.replace(re, () => {
      removed = true;
      return label;
    });
  }
  return { text: out, removed };
}

// Per-IP sliding window. In-memory, so it resets per server instance; enough to stop casual abuse
// in Phase 1. A shared store (e.g. Upstash/Vercel KV) can replace it later.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const hits = new Map<string, number[]>();

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS;
}
