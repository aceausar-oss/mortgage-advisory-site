"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

type Msg = { role: "user" | "assistant"; content: string };

// Chat window for the AI assistant (CLAUDE.md §11). Streams replies from /api/chat.
export function ChatAssistant({ initialQuestion, phone, phoneE164 }: { initialQuestion?: string; phone: string; phoneE164: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.body) throw new Error("no response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages([...history, { role: "assistant", content: `Sorry, something went wrong. You can reach Ace at ${phone} or [book a call](/book).` }]);
    } finally {
      setBusy(false);
    }
  }

  // Questions from the homepage box, chips, pills, and slider arrive as ?q= and start the conversation.
  useEffect(() => {
    if (initialQuestion && !started.current) {
      started.current = true;
      void send(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <section aria-label="Chat with our AI mortgage assistant" className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-brand-blue/50 sm:p-6">
      <header className="flex items-center gap-3 border-b border-brand-blue/30 pb-4">
        <span className="relative">
          <Image src="/brand/ace-polo.jpg" alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover object-top" />
          <Image src="/brand/logo-mark.png" alt="" width={20} height={20} className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white" />
        </span>
        <div>
          <p className="font-heading font-semibold text-brand-slate">Mortgage assistant</p>
          <p className="text-xs text-brand-slate">AI assistant for The Mortgage Advisory · Ace and our team take it from here</p>
        </div>
      </header>

      <div className="max-h-[60vh] min-h-40 space-y-4 overflow-y-auto py-4" aria-live="polite">
        {messages.length === 0 && (
          <p className="text-brand-slate">Hi! Ask me anything about HELOCs, reverse mortgages, buying a home, or refinancing.</p>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand-soft px-4 py-2.5 text-brand-ink">
              {m.content}
            </div>
          ) : (
            <div key={i} className="max-w-[92%] rounded-2xl rounded-bl-md bg-mist px-4 py-3 leading-relaxed text-brand-ink">
              {m.content ? <RichText text={m.content} /> : <TypingDots />}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-end gap-2 border-t border-brand-blue/30 pt-4"
      >
        <label htmlFor="chat-input" className="sr-only">
          Your question
        </label>
        <textarea
          id="chat-input"
          rows={2}
          maxLength={2000}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Type your question…"
          className="flex-1 resize-none rounded-2xl border border-brand-steel/40 px-4 py-2.5 focus:border-brand-blue"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue disabled:opacity-50"
        >
          Send
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-brand-slate">
        <p>
          Chat sessions may be recorded. By using chat you agree to our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>
          . Not a commitment to lend. Please don&apos;t share Social Security or account numbers.
        </p>
        <span className="flex gap-2">
          <Link href="/book" className="rounded-full bg-brand-soft px-3 py-1.5 font-semibold text-brand-ink hover:bg-brand-blue">
            Book a call with Ace
          </Link>
          <a href={`tel:${phoneE164}`} className="rounded-full border border-brand-blue px-3 py-1.5 font-semibold text-brand-slate">
            {phone}
          </a>
        </span>
      </div>
    </section>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand-blue-deep" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </span>
  );
}

// Minimal, safe markdown: paragraphs, "- " lists, **bold**, and links to our own pages or https URLs.
// Model text is rendered as React text nodes (never as raw HTML).
function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[1]) {
      const href = m[2];
      const safe = href.startsWith("/") || href.startsWith("https://");
      out.push(
        safe ? (
          href.startsWith("/") ? (
            <Link key={m.index} href={href} className="font-semibold text-brand-button underline underline-offset-2">
              {m[1]}
            </Link>
          ) : (
            <a key={m.index} href={href} rel="noopener noreferrer" target="_blank" className="font-semibold text-brand-button underline underline-offset-2">
              {m[1]}
            </a>
          )
        ) : (
          m[1]
        ),
      );
    } else {
      out.push(<strong key={m.index}>{m[3]}</strong>);
    }
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
