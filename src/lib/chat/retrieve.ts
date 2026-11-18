import { categoryLabel } from "@/lib/categories";
import { getEntries, type KbEntry } from "@/lib/kb";
import { siteUrl } from "@/lib/site";

// Chat retrieval (Ace, Nov 2026): instead of sending all ~90 answers with every message (~77k tokens, ~$0.35 each),
// the chat sends only the answers that match the conversation. Scoring is a small BM25-style keyword match over each
// answer's question, short answer, and body, with Spanish mortgage terms mapped to English (most answers are in
// English; the assistant still replies in Spanish). Answers the assistant already linked stay in the set so follow-up
// questions keep their context. Only reviewed answers are used, even on preview deploys.

export const MAX_ANSWERS = 8;

const STOP = new Set(
  (
    "a an and are as at be been but by can could did do does doing for from get got had has have how i if im in into is it its " +
    "just know like me might my no not now of on or our out really should so some than that the their them then there these " +
    "they this to too up us very want was we what when where which while who why will with would you your yours about any " +
    "also ok okay please thanks thank hi hello hey tell question questions loan loans mortgage mortgages home house"
  ).split(" "),
);
// Spanish stop words (after accents are stripped).
const STOP_ES = new Set(
  "el la los las un una unos unas de del al y o que en es son para por con mi mis su sus se lo le les me como cual cuanto cuando donde puedo puede quiero hola gracias tengo tiene hay si no mas muy ya pero este esta eso esa yo usted".split(
    " ",
  ),
);

// Spanish words a visitor might type → the English words the answers use. Keys are accent-free.
const ES_TERMS: Record<string, string> = {
  inversa: "reverse",
  hipoteca: "mortgage",
  refinanciar: "refinance",
  refinanciamiento: "refinance",
  refinanciacion: "refinance",
  liquido: "equity",
  plusvalia: "equity",
  efectivo: "cash",
  retiro: "cash-out",
  comprar: "buy purchase",
  compra: "buy purchase",
  comprador: "buyer",
  primera: "first-time",
  credito: "credit",
  puntaje: "score credit",
  enganche: "down payment",
  pago: "payment",
  pagos: "payment",
  deuda: "debt",
  deudas: "debt",
  tarjetas: "credit cards",
  consolidar: "consolidate",
  impuestos: "tax taxes",
  seguro: "insurance",
  jubilado: "retiree retirement",
  jubilacion: "retirement",
  pension: "pension",
  costos: "costs fees",
  costo: "cost fees",
  cierre: "closing",
  tasa: "rate",
  tasas: "rate rates",
  ingresos: "income",
  independiente: "self-employed",
  cuenta: "self-employed",
  estados: "bank statement",
  bancarios: "bank statement",
  renta: "rental rent",
  rentar: "rental",
  inversionista: "investor",
  inversion: "investment investor",
  propiedad: "property",
  preaprobacion: "pre-approval pre-approved",
  precalificacion: "pre-qualification",
  califico: "qualify",
  calificar: "qualify",
  documentos: "documents",
  veterano: "va veteran",
  veteranos: "va veteran",
  perder: "lose",
  casa: "home",
  herederos: "heirs",
  hijos: "heirs children",
  segunda: "second",
  segundo: "second",
  prestamista: "lender",
  corredor: "broker",
  texas: "texas",
  california: "california",
  florida: "florida",
  colorado: "colorado",
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ");

// Light stemming so "rentals"/"rental", "refinancing"/"refinance" meet.
const stem = (w: string) => w.replace(/(ing|ings|ed|es|s)$/, "").replace(/-/g, "");

function tokens(s: string, expandEs = false): string[] {
  const out: string[] = [];
  for (const raw of norm(s).split(/\s+/)) {
    if (raw.length < 2) continue;
    if (expandEs && ES_TERMS[raw]) {
      for (const t of ES_TERMS[raw].split(" ")) out.push(stem(t));
      continue;
    }
    if (STOP.has(raw) || STOP_ES.has(raw)) continue;
    // Keep short acronyms (VA, FHA, HOA); drop other 2-letter words.
    if (raw.length === 2 && !["va", "qm"].includes(raw)) continue;
    out.push(stem(raw));
  }
  return out;
}

type Doc = { e: KbEntry; q: Set<string>; t: Set<string>; b: Map<string, number>; len: number };
let index: { docs: Doc[]; idf: Map<string, number>; avg: number } | null = null;

function buildIndex() {
  if (index) return index;
  const docs: Doc[] = getEntries()
    .filter((e) => !e.isDraft)
    .map((e) => {
      const b = new Map<string, number>();
      const bt = tokens(e.body);
      for (const w of bt) b.set(w, (b.get(w) ?? 0) + 1);
      return { e, q: new Set(tokens(`${e.question} ${e.slug.replace(/-/g, " ")}`)), t: new Set(tokens(e.tldr)), b, len: bt.length };
    });
  const df = new Map<string, number>();
  for (const d of docs) for (const w of new Set([...d.q, ...d.t, ...d.b.keys()])) df.set(w, (df.get(w) ?? 0) + 1);
  const n = docs.length;
  const idf = new Map<string, number>();
  for (const [w, f] of df) idf.set(w, Math.log(1 + (n - f + 0.5) / (f + 0.5)));
  const avg = docs.reduce((s, d) => s + d.len, 0) / Math.max(n, 1);
  index = { docs, idf, avg };
  return index;
}

/** Score answers against weighted query terms; returns the best matches, best first. */
function rank(terms: Map<string, number>, limit: number): KbEntry[] {
  const { docs, idf, avg } = buildIndex();
  const scored = docs.map((d) => {
    let s = 0;
    for (const [w, weight] of terms) {
      const i = idf.get(w);
      if (!i) continue;
      const tf = d.b.get(w) ?? 0;
      const body = tf ? (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (d.len / avg))) : 0; // BM25 term weight
      s += weight * i * ((d.q.has(w) ? 3 : 0) + (d.t.has(w) ? 1.5 : 0) + body);
    }
    return { e: d.e, s };
  });
  const top = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  if (!top.length) return [];
  // Drop weak tail matches (under 20% of the best score) so a vague question doesn't drag in eight answers.
  const floor = top[0].s * 0.2;
  return top.filter((x) => x.s >= floor).slice(0, limit).map((x) => x.e);
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

/** The answers to send with this message: matches for the latest question (weighted most), earlier questions, and
 * any answer pages the assistant already linked in this conversation. */
export function retrieveAnswers(messages: ChatTurn[], limit = MAX_ANSWERS): KbEntry[] {
  const users = messages.filter((m) => m.role === "user").map((m) => m.content);
  const terms = new Map<string, number>();
  const add = (text: string, weight: number) => {
    for (const w of tokens(text, true)) terms.set(w, Math.max(terms.get(w) ?? 0, weight));
  };
  // A short follow-up ("what about Florida?") leans on the earlier questions for its topic.
  const latest = users.at(-1) ?? "";
  const earlierWeight = tokens(latest, true).length <= 4 ? 0.8 : 0.4;
  users.slice(-3).forEach((u, i, arr) => add(u, i === arr.length - 1 ? 1 : earlierWeight));

  const picked = new Map<string, KbEntry>();
  for (const e of rank(terms, limit)) picked.set(e.slug, e);

  // Keep answers the assistant already linked (most recent first) so follow-ups stay grounded.
  const all = new Map(buildIndex().docs.map((d) => [d.e.slug, d.e]));
  const linked = messages
    .filter((m) => m.role === "assistant")
    .flatMap((m) => [...m.content.matchAll(/\/answers\/([a-z0-9-]+)/g)].map((x) => x[1]))
    .reverse();
  for (const slug of linked) {
    if (picked.size >= limit + 2) break;
    const e = all.get(slug);
    if (e) picked.set(slug, e);
  }
  return [...picked.values()];
}

/** The retrieved answers as the <knowledge_base> block sent with this message. */
export function knowledgeBlock(entries: KbEntry[]): string {
  const body = entries
    .map(
      (e) =>
        `<answer url="${siteUrl}/answers/${e.slug}" path="/answers/${e.slug}" topic="${categoryLabel(e.category)}">\n# ${e.question}\nShort answer: ${e.tldr}\n\n${e.body}\n</answer>`,
    )
    .join("\n\n");
  return `<knowledge_base>\n${body || "(No answer in the knowledge base matched this message closely. Use the <answer_index> to point to a relevant page if one fits, or offer to connect them with our team.)"}\n</knowledge_base>`;
}

/** One line per reviewed answer (question → path), so the assistant can link pages that weren't retrieved. */
export function answerIndex(): string {
  return buildIndex()
    .docs.map((d) => `- ${d.e.question} → /answers/${d.e.slug}`)
    .join("\n");
}
