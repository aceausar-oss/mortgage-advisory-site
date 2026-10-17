import pricing from "../../content/data/pricing.json";
import {
  estimateReverse,
  MIN_AGE,
  type ReverseEstimate,
} from "@/lib/reverseCalc";
import type { Lang } from "@/lib/i18n";
import type { KbEntry } from "@/lib/kb";

type Product = KbEntry["products"][number];

// "See what you qualify for" quiz (/qualify, /pre-approval; Ace, Oct 2026). One short question per screen, four paths:
// buy, refinance, cash from home (HELOC / cash-out), reverse mortgage. It is a pre-qualification snapshot, NOT a loan
// application: it never asks for SSN, date of birth, account numbers, or a property address (with name, income, and
// SSN those would make a TRID "application"). The full application happens after the call.
// Results use the site's existing math only: the affordability rule of thumb from /answers/how-much-house-can-i-afford,
// the equity formula from /how-we-estimate (pricing.json maxCLTV), and the HUD-table reverse estimate (reverseCalc).
// No rates, APRs, or loan payments are ever shown (CLAUDE.md §8, §9).

export type Goal = "buy" | "refi" | "cash" | "reverse";
export const GOALS: Goal[] = ["buy", "refi", "cash", "reverse"];
export type Answers = Record<string, string | number>;

type Text = { en: string; es: string };
type Option = { value: string; label: Text };

export type Question =
  | {
      id: string;
      kind: "choice";
      title: Text;
      help?: Text;
      options: Option[];
      show?: (a: Answers) => boolean;
    }
  | {
      id: string;
      kind: "money";
      title: Text;
      help?: Text;
      min: number;
      max: number;
      step: number;
      initial: number | ((a: Answers) => number);
      perMonth?: boolean;
      show?: (a: Answers) => boolean;
    }
  | {
      id: string;
      kind: "age";
      title: Text;
      help?: Text;
      min: number;
      max: number;
      initial: number;
      show?: (a: Answers) => boolean;
    }
  | {
      id: string;
      kind: "text";
      title: Text;
      help?: Text;
      placeholder: Text;
      optional: true;
      show?: (a: Answers) => boolean;
    };

const t = (en: string, es: string): Text => ({ en, es });
const o = (value: string, en: string, es: string): Option => ({
  value,
  label: { en, es },
});

export const GOAL_QUESTION: Question = {
  id: "goal",
  kind: "choice",
  title: t("What would you like to do?", "¿Qué le gustaría hacer?"),
  help: t(
    "About 2 minutes. No credit check, and no Social Security number.",
    "Unos 2 minutos. Sin revisar su crédito y sin número de Seguro Social.",
  ),
  options: [
    o("buy", "Buy a home", "Comprar una casa"),
    o("refi", "Refinance my mortgage", "Refinanciar mi hipoteca"),
    o(
      "cash",
      "Get cash from my home (HELOC or cash-out)",
      "Sacar dinero de mi casa (HELOC o con retiro de efectivo)",
    ),
    o(
      "reverse",
      "Reverse mortgage (62 or older)",
      "Hipoteca inversa (62 años o más)",
    ),
  ],
};

const STATE: Question = {
  id: "state",
  kind: "choice",
  title: t("Where is the home?", "¿Dónde está la casa?"),
  options: [
    o("CA", "California", "California"),
    o("TX", "Texas", "Texas"),
    o("FL", "Florida", "Florida"),
    o("CO", "Colorado", "Colorado"),
    o("other", "Another state", "Otro estado"),
  ],
};

const CITY: Question = {
  id: "city",
  kind: "text",
  optional: true,
  title: t("What city or area?", "¿En qué ciudad o zona?"),
  help: t(
    "Just the city. We don't need an address.",
    "Solo la ciudad. No necesitamos la dirección.",
  ),
  placeholder: t("e.g. Irvine", "p. ej., Irvine"),
};

const CREDIT: Question = {
  id: "credit",
  kind: "choice",
  title: t(
    "What's your credit score, roughly?",
    "¿Cuál es su puntaje de crédito, más o menos?",
  ),
  help: t(
    "Your best guess is fine. We won't check your credit here.",
    "Un cálculo aproximado está bien. Aquí no revisamos su crédito.",
  ),
  options: [
    o("760", "760 or higher", "760 o más"),
    o("700", "700 to 759", "700 a 759"),
    o("660", "660 to 699", "660 a 699"),
    o("620", "620 to 659", "620 a 659"),
    o("580", "580 to 619", "580 a 619"),
    o("lt580", "Under 580", "Menos de 580"),
    o("unknown", "Not sure", "No estoy seguro"),
  ],
};

const INCOME_TYPE: Question = {
  id: "incomeType",
  kind: "choice",
  title: t(
    "How do you earn most of your income?",
    "¿Cómo gana la mayor parte de sus ingresos?",
  ),
  options: [
    o("w2", "Paycheck (W-2 employee)", "Sueldo (empleado W-2)"),
    o("self", "Self-employed or 1099", "Trabajo por cuenta propia o 1099"),
    o(
      "retired",
      "Retirement, Social Security, or pension",
      "Jubilación, Seguro Social o pensión",
    ),
    o("mix", "A mix of these", "Una combinación"),
  ],
};

const TIMELINE: Question = {
  id: "timeline",
  kind: "choice",
  title: t(
    "When would you like to get started?",
    "¿Cuándo le gustaría empezar?",
  ),
  options: [
    o("now", "Right away", "De inmediato"),
    o("3mo", "In the next 3 months", "En los próximos 3 meses"),
    o("6mo", "3 to 6 months", "De 3 a 6 meses"),
    o("later", "Just exploring for now", "Por ahora solo estoy explorando"),
  ],
};

const CURRENT_RATE: Question = {
  id: "currentRate",
  kind: "choice",
  title: t(
    "What's the rate on your current mortgage?",
    "¿Qué tasa tiene su hipoteca actual?",
  ),
  help: t(
    "Check your monthly statement if you're not sure.",
    "Si no está seguro, revise su estado de cuenta mensual.",
  ),
  options: [
    o("lt4", "Under 4%", "Menos de 4 %"),
    o("4to6", "4% to 5.99%", "4 % a 5.99 %"),
    o("6to7", "6% to 6.99%", "6 % a 6.99 %"),
    o("7plus", "7% or higher", "7 % o más"),
    o("none", "No mortgage (paid off)", "No tengo hipoteca (está pagada)"),
    o("unknown", "Not sure", "No estoy seguro"),
  ],
};

const HOME_VALUE = (initial = 750_000): Question => ({
  id: "homeValue",
  kind: "money",
  title: t(
    "About how much is your home worth?",
    "¿Cuánto vale su casa, más o menos?",
  ),
  help: t(
    "A rough estimate is fine. We confirm value later.",
    "Un estimado está bien. El valor se confirma más adelante.",
  ),
  min: 100_000,
  max: 3_000_000,
  step: 5_000,
  initial,
});

const BALANCE: Question = {
  id: "balance",
  kind: "money",
  title: t(
    "What do you still owe on your mortgage?",
    "¿Cuánto debe todavía en su hipoteca?",
  ),
  help: t(
    "Include any second mortgage or HELOC. Enter 0 if it's paid off.",
    "Incluya cualquier segunda hipoteca o HELOC. Escriba 0 si está pagada.",
  ),
  min: 0,
  max: 2_500_000,
  step: 5_000,
  initial: (a) =>
    Math.round(
      ((Number(a.homeValue) || 750_000) * (a.goal === "reverse" ? 0.2 : 0.4)) /
        5_000,
    ) * 5_000,
};

export const PATHS: Record<Goal, Question[]> = {
  buy: [
    {
      id: "stage",
      kind: "choice",
      title: t("Where are you in the process?", "¿En qué etapa está?"),
      options: [
        o("starting", "Just starting to look", "Apenas empiezo a buscar"),
        o(
          "offers",
          "Ready to make offers soon",
          "Listo para hacer ofertas pronto",
        ),
        o(
          "found",
          "I found a home (or I'm in escrow)",
          "Ya encontré una casa (o estoy en escrow)",
        ),
      ],
    },
    {
      id: "firstTime",
      kind: "choice",
      title: t("Is this your first home?", "¿Es su primera casa?"),
      help: t(
        "Not owned a home in the last 3 years counts as first-time for many programs.",
        "Para muchos programas, si no ha tenido casa en los últimos 3 años, cuenta como primera vez.",
      ),
      options: [
        o("yes", "Yes", "Sí"),
        o("no", "No, I've owned before", "No, ya he tenido casa"),
      ],
    },
    STATE,
    CITY,
    {
      id: "price",
      kind: "money",
      title: t(
        "What price range are you looking at?",
        "¿En qué rango de precio está buscando?",
      ),
      min: 100_000,
      max: 3_000_000,
      step: 5_000,
      initial: 600_000,
    },
    {
      id: "down",
      kind: "money",
      title: t(
        "How much do you have for a down payment?",
        "¿Cuánto tiene para el enganche (pago inicial)?",
      ),
      help: t(
        "Savings you plan to use, plus any gift from family.",
        "Ahorros que piensa usar, más cualquier regalo de su familia.",
      ),
      min: 0,
      max: 1_000_000,
      step: 1_000,
      initial: 30_000,
    },
    {
      id: "military",
      kind: "choice",
      title: t(
        "Have you or your spouse served in the military?",
        "¿Usted o su cónyuge han servido en las fuerzas armadas?",
      ),
      options: [
        o(
          "yes",
          "Yes (veteran, active duty, Guard, or Reserve)",
          "Sí (veterano, servicio activo, Guardia o Reserva)",
        ),
        o("no", "No", "No"),
      ],
    },
    CREDIT,
    INCOME_TYPE,
    {
      id: "income",
      kind: "money",
      perMonth: true,
      title: t(
        "What's your household's monthly income before taxes?",
        "¿Cuál es el ingreso mensual de su hogar antes de impuestos?",
      ),
      help: t(
        "Everyone who will be on the loan.",
        "De todas las personas que estarán en el préstamo.",
      ),
      min: 0,
      max: 50_000,
      step: 250,
      initial: 9_000,
    },
    {
      id: "debts",
      kind: "money",
      perMonth: true,
      title: t(
        "What do you pay each month on debts?",
        "¿Cuánto paga al mes en deudas?",
      ),
      help: t(
        "Car payments, student loans, and credit card minimums. Not rent, utilities, or phone.",
        "Pagos de auto, préstamos estudiantiles y pagos mínimos de tarjetas. No incluya renta, servicios ni teléfono.",
      ),
      min: 0,
      max: 15_000,
      step: 50,
      initial: 500,
    },
    TIMELINE,
  ],
  refi: [
    STATE,
    CITY,
    HOME_VALUE(),
    BALANCE,
    {
      id: "loanType",
      kind: "choice",
      title: t(
        "What kind of loan do you have now?",
        "¿Qué tipo de préstamo tiene ahora?",
      ),
      options: [
        o("conv", "Conventional", "Convencional"),
        o("fha", "FHA", "FHA"),
        o("va", "VA", "VA"),
        o("arm", "Adjustable rate (ARM)", "Tasa ajustable (ARM)"),
        o("unknown", "Not sure", "No estoy seguro"),
      ],
    },
    {
      ...CURRENT_RATE,
      options: CURRENT_RATE.options.filter((x) => x.value !== "none"),
    },
    {
      id: "refiGoal",
      kind: "choice",
      title: t("What's the main goal?", "¿Cuál es el objetivo principal?"),
      options: [
        o("payment", "Lower my monthly payment", "Bajar mi pago mensual"),
        o(
          "mi",
          "Get rid of mortgage insurance",
          "Quitar el seguro hipotecario",
        ),
        o("term", "Pay my home off sooner", "Terminar de pagar mi casa antes"),
        o(
          "fixed",
          "Switch from an adjustable rate to fixed",
          "Cambiar de tasa ajustable a fija",
        ),
        o("cash", "Take cash out", "Sacar dinero"),
        o(
          "remove",
          "Remove someone from the loan",
          "Quitar a alguien del préstamo",
        ),
      ],
    },
    CREDIT,
    INCOME_TYPE,
    TIMELINE,
  ],
  cash: [
    STATE,
    CITY,
    HOME_VALUE(),
    BALANCE,
    {
      id: "cashNeeded",
      kind: "money",
      title: t(
        "About how much cash do you need?",
        "¿Cuánto dinero necesita, más o menos?",
      ),
      min: 5_000,
      max: 1_000_000,
      step: 5_000,
      initial: 75_000,
    },
    {
      id: "purpose",
      kind: "choice",
      title: t("What's the money for?", "¿Para qué es el dinero?"),
      options: [
        o("improve", "Home improvements", "Mejoras a la casa"),
        o(
          "debt",
          "Pay off higher-interest debt",
          "Pagar deudas con intereses más altos",
        ),
        o("big", "Education or a big purchase", "Estudios o una compra grande"),
        o(
          "buffer",
          "A safety net for emergencies",
          "Un respaldo para emergencias",
        ),
        o("invest", "Investment or business", "Inversión o negocio"),
        o("other", "Something else", "Otra cosa"),
      ],
    },
    CURRENT_RATE,
    CREDIT,
    INCOME_TYPE,
    {
      id: "over62",
      kind: "choice",
      title: t(
        "Is everyone on the title 62 or older?",
        "¿Todas las personas en el título tienen 62 años o más?",
      ),
      help: t(
        "If so, a reverse mortgage may be another option.",
        "Si es así, una hipoteca inversa puede ser otra opción.",
      ),
      options: [o("yes", "Yes", "Sí"), o("no", "No", "No")],
    },
    TIMELINE,
  ],
  reverse: [
    STATE,
    CITY,
    {
      id: "age",
      kind: "age",
      title: t(
        "How old is the youngest homeowner or spouse?",
        "¿Qué edad tiene el propietario o cónyuge más joven?",
      ),
      help: t(
        "Include a spouse even if they're not on the title.",
        "Incluya a su cónyuge aunque no esté en el título.",
      ),
      min: 55,
      max: 95,
      initial: 70,
    },
    HOME_VALUE(650_000),
    BALANCE,
    {
      id: "reverseGoal",
      kind: "choice",
      title: t("What would help most?", "¿Qué le ayudaría más?"),
      options: [
        o(
          "payoff",
          "No more monthly mortgage payment",
          "Ya no tener pago mensual de hipoteca",
        ),
        o("income", "Extra monthly income", "Ingreso mensual adicional"),
        o(
          "loc",
          "A line of credit for later",
          "Una línea de crédito para después",
        ),
        o("care", "Paying for care at home", "Pagar cuidados en casa"),
        o(
          "lump",
          "Cash for a project or family",
          "Dinero para un proyecto o la familia",
        ),
        o("exploring", "Just learning about it", "Solo quiero informarme"),
      ],
    },
    {
      id: "keepFirst",
      kind: "choice",
      show: (a) => Number(a.balance) > 0,
      title: t(
        "Would you like to keep your current mortgage?",
        "¿Le gustaría conservar su hipoteca actual?",
      ),
      help: t(
        "Some homeowners have a low rate they'd rather not give up.",
        "Algunos propietarios tienen una tasa baja que prefieren no perder.",
      ),
      options: [
        o("yes", "Yes, I'd like to keep it", "Sí, me gustaría conservarla"),
        o("no", "No, paying it off is fine", "No, está bien pagarla"),
        o("unsure", "Not sure", "No estoy seguro"),
      ],
    },
    TIMELINE,
  ],
};

/** The questions this visitor will see, in order (the goal question first). */
export function questionsFor(a: Answers): Question[] {
  const goal = a.goal as Goal | undefined;
  if (!goal || !PATHS[goal]) return [GOAL_QUESTION];
  return [GOAL_QUESTION, ...PATHS[goal].filter((q) => !q.show || q.show(a))];
}

export const LICENSED = ["CA", "TX", "FL", "CO"] as const;
export const optionLabel = (q: Question, value: string | number, lang: Lang) =>
  q.kind === "choice"
    ? (q.options.find((x) => x.value === value)?.label[lang] ?? String(value))
    : String(value);

// ---------- Results ----------

export const usd = (n: number) =>
  Math.round(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
const pct = (n: number) => `${Math.round(n * 100)}%`;
const num = (a: Answers, k: string) => Math.max(0, Number(a[k]) || 0);
const creditAtLeast = (a: Answers, floor: number) => {
  const c = String(a.credit);
  const v = c === "lt580" ? 500 : c === "unknown" ? 0 : Number(c);
  return v >= floor;
};

export type Link = { href: string; label: Text };
export type Program = { name: Text; why: Text };
export type Result = {
  goal: Goal;
  /** Headline number (dollar figure or range) shown big at the top, if this path has one. */
  figure?: { label: Text; value: string; math?: string };
  extra?: { label: Text; value: string }[];
  notes: Text[];
  programs: Program[];
  checklist: Text[];
  reads: Link[];
  booking: "purchase" | "equity" | "reverse";
  /** Drives the <Disclosures> box: loan products shown, and whether debt consolidation came up. */
  disclosures: { products: Product[]; debt?: boolean };
  /** One-line plain-English summary for Ace in Go High Level. */
  summary: string;
};

const ans = (slug: string, en: string, es: string): Link => ({
  href: `/answers/${slug}`,
  label: t(en, es),
});

function docs(a: Answers, base: Text[]): Text[] {
  const it = String(a.incomeType);
  const list = [...base];
  if (it === "w2" || it === "mix")
    list.push(
      t(
        "Pay stubs for the last 30 days and W-2s for the last 2 years",
        "Talones de pago de los últimos 30 días y formularios W-2 de los últimos 2 años",
      ),
    );
  if (it === "self" || it === "mix")
    list.push(
      t(
        "Last 2 years of personal and business tax returns, or 12 to 24 months of bank statements",
        "Declaraciones de impuestos personales y del negocio de los últimos 2 años, o de 12 a 24 meses de estados de cuenta bancarios",
      ),
    );
  if (it === "retired" || it === "mix")
    list.push(
      t(
        "Social Security and pension award letters, plus retirement account statements",
        "Cartas de beneficios del Seguro Social y de la pensión, y estados de cuenta de jubilación",
      ),
    );
  list.push(t("A government photo ID", "Una identificación oficial con foto"));
  return list;
}

function buyResult(a: Answers): Result {
  const income = num(a, "income");
  const debts = num(a, "debts");
  const price = num(a, "price");
  const down = num(a, "down");
  const downPct = price > 0 ? down / price : 0;
  const military = a.military === "yes";
  const first = a.firstTime === "yes";
  const self = a.incomeType === "self" || a.incomeType === "mix";
  const comfortLow = income * 0.28;
  const comfortHigh = income * 0.31;
  const stretch = Math.max(0, income * 0.45 - debts);
  const dti = income > 0 ? debts / income : 0;

  const programs: Program[] = [];
  if (military)
    programs.push({
      name: t("VA loan", "Préstamo VA"),
      why: t(
        "No down payment required and no monthly mortgage insurance, if you're eligible.",
        "No requiere enganche ni seguro hipotecario mensual, si usted es elegible.",
      ),
    });
  if (creditAtLeast(a, 620) && (downPct >= 0.05 || (first && downPct >= 0.03)))
    programs.push({
      name: t("Conventional loan", "Préstamo convencional"),
      why: first
        ? t(
            "As little as 3% down for first-time buyers, and mortgage insurance comes off later.",
            "Desde 3 % de enganche para compradores de primera vez, y el seguro hipotecario se puede quitar después.",
          )
        : t(
            "5% down or more, and mortgage insurance comes off once you reach 20% equity.",
            "Con 5 % de enganche o más, y el seguro hipotecario se quita al llegar a 20 % de valor líquido.",
          ),
    });
  if (creditAtLeast(a, 580) && !creditAtLeast(a, 700) && downPct >= 0.035)
    programs.push({
      name: t("FHA loan", "Préstamo FHA"),
      why: t(
        "3.5% down with more flexible credit guidelines.",
        "3.5 % de enganche con reglas de crédito más flexibles.",
      ),
    });
  if (self)
    programs.push({
      name: t(
        "Bank statement loan (Non-QM)",
        "Préstamo con estados de cuenta bancarios (Non-QM)",
      ),
      why: t(
        "Qualify with bank deposits instead of tax returns, if write-offs lower your taxable income.",
        "Califique con los depósitos de su banco en lugar de sus impuestos, si las deducciones bajan su ingreso declarado.",
      ),
    });
  if ((first || downPct < 0.05) && !military)
    programs.push({
      name: t("Down payment assistance", "Ayuda para el enganche"),
      why: t(
        "State and local programs in all four of our states can help with the down payment or closing costs.",
        "Hay programas estatales y locales en nuestros cuatro estados que pueden ayudar con el enganche o los costos de cierre.",
      ),
    });
  if (!programs.length)
    programs.push({
      name: t("A plan to get you ready", "Un plan para prepararlo"),
      why: t(
        "Based on your answers, the next step is a short plan for credit or savings. We'll map it out together.",
        "Según sus respuestas, el siguiente paso es un plan corto de crédito o ahorro. Lo haremos juntos.",
      ),
    });

  const notes: Text[] = [];
  if (income > 0 && stretch < comfortLow)
    notes.push(
      t(
        "Your current debt payments use up most of the room lenders allow, so the housing budget is tighter than the usual rule of thumb. Paying down a balance or adding a co-borrower can open it up.",
        "Sus pagos de deudas actuales usan casi todo el margen que permiten los prestamistas, así que el presupuesto de vivienda es más ajustado de lo normal. Pagar un saldo o agregar un coprestatario puede ampliarlo.",
      ),
    );
  else if (dti > 0.2)
    notes.push(
      t(
        `Your debts already use about ${pct(dti)} of your income, which lowers the house payment lenders allow. Paying off a small balance before applying can help.`,
        `Sus deudas ya usan cerca del ${pct(dti)} de su ingreso, lo que baja el pago de casa que permiten los prestamistas. Liquidar un saldo pequeño antes de solicitar puede ayudar.`,
      ),
    );
  if (!creditAtLeast(a, 580) && a.credit !== "unknown")
    notes.push(
      t(
        "With a score under 580, options are limited but not zero. A few targeted credit moves can raise your score within a few months.",
        "Con un puntaje menor de 580, las opciones son limitadas, pero existen. Unos pasos concretos pueden subir su puntaje en pocos meses.",
      ),
    );
  if (price > 0 && downPct < 0.2 && !military)
    notes.push(
      t(
        `${usd(down)} is about ${pct(downPct)} of ${usd(price)}. Under 20% down usually means mortgage insurance, which we'll include in your real numbers.`,
        `${usd(down)} es cerca del ${pct(downPct)} de ${usd(price)}. Con menos de 20 % de enganche normalmente se paga seguro hipotecario, que incluiremos en sus números reales.`,
      ),
    );
  notes.push(
    t(
      "On the call, we turn this budget into a price range using today's pricing plus the taxes and insurance where you're buying.",
      "En la llamada convertimos este presupuesto en un rango de precio, con los precios de hoy y los impuestos y seguro de la zona donde va a comprar.",
    ),
  );

  return {
    goal: "buy",
    figure: {
      label: t(
        "A comfortable monthly housing budget",
        "Un presupuesto mensual cómodo para vivienda",
      ),
      value:
        income > 0
          ? `${usd(Math.min(comfortLow, stretch))} – ${usd(Math.min(comfortHigh, stretch))}`
          : "—",
      math: income > 0 ? `${usd(income)} × 28%–31%` : undefined,
    },
    extra: [
      {
        label: t(
          "What many programs may allow (all debts up to about 45% of income)",
          "Lo que muchos programas pueden permitir (todas las deudas hasta cerca del 45 % del ingreso)",
        ),
        value: income > 0 ? usd(stretch) : "—",
      },
      {
        label: t("Down payment you entered", "Enganche que indicó"),
        value: price > 0 ? `${usd(down)} (${pct(downPct)})` : usd(down),
      },
    ],
    notes,
    programs,
    checklist: docs(a, [
      t(
        "Last 2 months of bank statements (all pages)",
        "Estados de cuenta bancarios de los últimos 2 meses (todas las páginas)",
      ),
      ...(military
        ? [
            t(
              "Your DD-214 or Statement of Service (we can usually pull your COE for you)",
              "Su DD-214 o constancia de servicio (normalmente podemos obtener su COE por usted)",
            ),
          ]
        : []),
    ]),
    reads: [
      ans(
        "how-much-house-can-i-afford",
        "How much house can I afford?",
        "¿Cuánta casa puedo pagar?",
      ),
      ans(
        "how-much-down-payment-do-i-need",
        "How much down payment do I need?",
        "¿Cuánto enganche necesito?",
      ),
      ...(military
        ? [
            ans(
              "va-loan-eligibility-coe",
              "Am I eligible for a VA loan?",
              "¿Soy elegible para un préstamo VA?",
            ),
          ]
        : []),
      ...(self
        ? [
            ans(
              "self-employed-mortgage-qualify",
              "Can I qualify if I'm self-employed?",
              "¿Puedo calificar si trabajo por mi cuenta?",
            ),
          ]
        : []),
      ...(first
        ? [
            ans(
              "down-payment-assistance-ca-tx-fl-co",
              "Down payment help in CA, TX, FL, and CO",
              "Ayuda para el enganche en CA, TX, FL y CO",
            ),
          ]
        : []),
    ],
    booking: "purchase",
    disclosures: {
      products: [
        ...(military ? (["va"] as const) : []),
        ...(programs.some((p) => p.name.en === "FHA loan")
          ? (["fha"] as const)
          : []),
      ],
    },
    summary: `Buy: ${a.firstTime === "yes" ? "first-time buyer" : "repeat buyer"}, ${a.stage}, price ~${usd(price)}, down ${usd(down)} (${pct(downPct)}), income ${usd(income)}/mo, debts ${usd(debts)}/mo (DTI now ${pct(dti)}), comfortable housing ${usd(comfortLow)}-${usd(comfortHigh)}/mo, stretch ${usd(stretch)}/mo. Fits: ${programs.map((p) => p.name.en).join(", ")}.`,
  };
}

function refiResult(a: Answers): Result {
  const value = num(a, "homeValue");
  const balance = num(a, "balance");
  const ltv = value > 0 ? balance / value : 0;
  const cashOut = Math.max(0, value * pricing.maxCLTV.cashOut - balance);
  const goal = String(a.refiGoal);
  const type = String(a.loanType);
  const lowRate = a.currentRate === "lt4" || a.currentRate === "4to6";
  const programs: Program[] = [];
  const reads: Link[] = [];
  const notes: Text[] = [];

  if (type === "va" && (goal === "payment" || goal === "fixed")) {
    programs.push({
      name: t(
        "VA streamline refinance (IRRRL)",
        "Refinanciamiento VA simplificado (IRRRL)",
      ),
      why: t(
        "Usually no appraisal and very little paperwork, if it lowers your rate or moves you to a fixed rate.",
        "Normalmente sin avalúo y con muy poco papeleo, si baja su tasa o lo pasa a tasa fija.",
      ),
    });
    reads.push(
      ans(
        "va-streamline-refinance-irrrl",
        "How does a VA streamline refinance work?",
        "¿Cómo funciona el refinanciamiento VA simplificado?",
      ),
    );
  }
  if (type === "fha" && (goal === "mi" || goal === "payment")) {
    if (ltv <= 0.8 && creditAtLeast(a, 620)) {
      programs.push({
        name: t(
          "FHA to conventional refinance",
          "Refinanciamiento de FHA a convencional",
        ),
        why: t(
          `You owe about ${pct(ltv)} of your home's value, so a conventional loan could drop FHA mortgage insurance for good.`,
          `Debe cerca del ${pct(ltv)} del valor de su casa, así que un préstamo convencional podría quitar el seguro hipotecario de la FHA para siempre.`,
        ),
      });
    } else {
      programs.push({
        name: t(
          "FHA streamline refinance",
          "Refinanciamiento FHA simplificado",
        ),
        why: t(
          "Lowers the rate on your FHA loan with less paperwork, often without an appraisal.",
          "Baja la tasa de su préstamo FHA con menos papeleo, muchas veces sin avalúo.",
        ),
      });
    }
    reads.push(
      ans(
        "fha-to-conventional-refinance",
        "When does FHA to conventional make sense?",
        "¿Cuándo conviene pasar de FHA a convencional?",
      ),
    );
  }
  if (type !== "fha" && goal === "mi")
    programs.push({
      name: t("Mortgage insurance removal", "Quitar el seguro hipotecario"),
      why:
        ltv <= 0.8
          ? t(
              `At about ${pct(ltv)} of value, you may be able to ask your servicer to drop it without refinancing.`,
              `Con cerca del ${pct(ltv)} del valor, puede pedirle a su administrador que lo quite sin refinanciar.`,
            )
          : t(
              "Once you owe 80% of the original value or less, conventional mortgage insurance can come off.",
              "Cuando deba 80 % del valor original o menos, el seguro hipotecario convencional se puede quitar.",
            ),
    });
  if (goal === "term")
    programs.push({
      name: t(
        "Rate-and-term refinance to a shorter loan",
        "Refinanciamiento a un plazo más corto",
      ),
      why: t(
        "A 15- or 20-year loan builds equity faster and cuts total interest.",
        "Un préstamo a 15 o 20 años crea valor líquido más rápido y reduce el total de intereses.",
      ),
    });
  if (goal === "fixed" || type === "arm") {
    programs.push({
      name: t("Fixed-rate refinance", "Refinanciamiento a tasa fija"),
      why: t(
        "Locks your payment so it can't rise when the adjustable period ends.",
        "Fija su pago para que no suba cuando termine el periodo ajustable.",
      ),
    });
    reads.push(
      ans(
        "arm-vs-buydown-vs-fixed",
        "ARM, buydown, or fixed?",
        "¿ARM, tasa reducida temporal o fija?",
      ),
    );
  }
  if (goal === "cash") {
    programs.push(
      lowRate
        ? {
            name: t(
              "HELOC (keep your current rate)",
              "HELOC (conserve su tasa actual)",
            ),
            why: t(
              "Your current rate is low, so borrowing on top of it usually beats replacing the whole loan.",
              "Su tasa actual es baja, así que pedir prestado encima de ella suele convenir más que reemplazar todo el préstamo.",
            ),
          }
        : {
            name: t(
              "Cash-out refinance",
              "Refinanciamiento con retiro de efectivo",
            ),
            why: t(
              "One new loan that pays off your mortgage and gives you cash.",
              "Un préstamo nuevo que paga su hipoteca y le da efectivo.",
            ),
          },
    );
    reads.push(
      ans(
        "heloc-vs-cash-out-refinance",
        "HELOC or cash-out refinance?",
        "¿HELOC o refinanciamiento con retiro de efectivo?",
      ),
    );
  }
  if (goal === "remove")
    programs.push({
      name: t("Refinance into your name", "Refinanciar a su nombre"),
      why: t(
        "Usually after a divorce or separation. You'll qualify on your own income.",
        "Normalmente después de un divorcio o separación. Calificará con su propio ingreso.",
      ),
    });
  if (goal === "payment" && !programs.length)
    programs.push({
      name: t("Rate-and-term refinance", "Refinanciamiento de tasa y plazo"),
      why: t(
        "A new loan at a lower rate, if today's pricing beats yours by enough to cover the costs.",
        "Un préstamo nuevo a una tasa más baja, si los precios de hoy mejoran la suya lo suficiente para cubrir los costos.",
      ),
    });

  if (lowRate && goal === "payment")
    notes.push(
      t(
        "Your rate is already on the low side, so a full refinance may not pay off. We'll check today's pricing against yours and tell you straight.",
        "Su tasa ya es bastante baja, así que refinanciar todo quizá no convenga. Compararemos los precios de hoy con su tasa y le diremos la verdad.",
      ),
    );
  if (ltv > 0.95)
    notes.push(
      t(
        "You owe close to your home's full value, which narrows the options. Streamline programs may still work.",
        "Debe casi todo el valor de su casa, lo que limita las opciones. Los programas simplificados todavía pueden funcionar.",
      ),
    );
  notes.push(
    t(
      "A refinance is worth it when the savings cover the costs within a time you're comfortable with. We'll show you the break-even month on a real Loan Estimate.",
      "Un refinanciamiento vale la pena cuando el ahorro cubre los costos en un tiempo que le parezca bien. Le mostraremos el mes en que recupera los costos en un Estimado del Préstamo real.",
    ),
  );
  reads.push(
    ans(
      "when-is-refinancing-worth-it",
      "When is refinancing worth it?",
      "¿Cuándo vale la pena refinanciar?",
    ),
    ans(
      "no-closing-cost-refinance",
      "Is a no-closing-cost refinance a good deal?",
      "¿Conviene un refinanciamiento sin costos de cierre?",
    ),
  );

  return {
    goal: "refi",
    figure: {
      label: t("Your equity today", "Su valor líquido hoy"),
      value: usd(Math.max(0, value - balance)),
      math: `${usd(value)} − ${usd(balance)}`,
    },
    extra: [
      {
        label: t(
          "You owe about this share of your home's value",
          "Debe cerca de esta parte del valor de su casa",
        ),
        value: pct(ltv),
      },
      ...(goal === "cash"
        ? [
            {
              label: t(
                "Cash-out estimate (up to 80% of value)",
                "Estimado de efectivo (hasta 80 % del valor)",
              ),
              value: usd(cashOut),
            },
          ]
        : []),
    ],
    notes,
    programs,
    checklist: docs(a, [
      t(
        "Your latest mortgage statement",
        "Su estado de cuenta hipotecario más reciente",
      ),
      t(
        "Your homeowners insurance declarations page",
        "La página de declaraciones de su seguro de vivienda",
      ),
      t(
        "Last 2 months of bank statements",
        "Estados de cuenta bancarios de los últimos 2 meses",
      ),
    ]),
    reads,
    booking: "equity",
    disclosures: {
      products: [
        ...(type === "va" ? (["va"] as const) : []),
        ...(type === "fha" ? (["fha"] as const) : []),
        ...(goal === "cash" && lowRate ? (["heloc"] as const) : []),
      ],
    },
    summary: `Refinance: ${type} loan, rate ${a.currentRate}, goal ${goal}, value ${usd(value)}, owes ${usd(balance)} (LTV ${pct(ltv)}). Fits: ${programs.map((p) => p.name.en).join(", ")}.`,
  };
}

function cashResult(a: Answers): Result {
  const value = num(a, "homeValue");
  const balance = num(a, "balance");
  const need = num(a, "cashNeeded");
  const available = Math.max(
    0,
    Math.round(value * pricing.maxCLTV.heloc - balance),
  );
  const fits = need <= available;
  const cltv = value > 0 ? (balance + need) / value : 0;
  const keepRate = a.currentRate === "lt4" || a.currentRate === "4to6";
  const noMortgage = a.currentRate === "none" || balance === 0;
  const senior = a.over62 === "yes";
  const debt = a.purpose === "debt";
  const programs: Program[] = [];
  const notes: Text[] = [];

  if (keepRate || noMortgage)
    programs.push({
      name: t("HELOC", "HELOC"),
      why: noMortgage
        ? t(
            "Borrow only what you use, and pay interest only on what you draw.",
            "Use solo lo que necesita y pague intereses solo sobre lo que retire.",
          )
        : t(
            "Keeps your low first-mortgage rate. You borrow only what you use.",
            "Conserva la tasa baja de su primera hipoteca. Solo usa lo que necesita.",
          ),
    });
  if (!keepRate && !noMortgage)
    programs.push(
      {
        name: t(
          "Cash-out refinance",
          "Refinanciamiento con retiro de efectivo",
        ),
        why: t(
          "With a higher current rate, one new loan for everything may cost less than adding a second loan.",
          "Con una tasa actual más alta, un solo préstamo nuevo puede costar menos que agregar un segundo préstamo.",
        ),
      },
      {
        name: t("HELOC", "HELOC"),
        why: t(
          "Still worth comparing if you need the money in stages or plan to pay it back quickly.",
          "Vale la pena compararla si necesita el dinero por partes o piensa pagarlo pronto.",
        ),
      },
    );
  if (senior)
    programs.push({
      name: t(
        "Reverse mortgage second (62+)",
        "Hipoteca inversa de segundo gravamen (62+)",
      ),
      why: t(
        "Cash or a line of credit with no required monthly payment, while you keep your first mortgage.",
        "Efectivo o una línea de crédito sin pago mensual obligatorio, conservando su primera hipoteca.",
      ),
    });
  if (!creditAtLeast(a, 660) && a.credit !== "unknown")
    notes.push(
      t(
        "Most HELOCs look for a score around 660 or higher. A cash-out refinance or other options may fit better; we'll check.",
        "La mayoría de las HELOC piden un puntaje de 660 o más. Un refinanciamiento con retiro de efectivo u otras opciones pueden funcionar mejor; lo revisaremos.",
      ),
    );
  if (!fits)
    notes.push(
      t(
        `${usd(need)} is about ${usd(need - available)} more than this estimate. A smaller amount now, a program that allows more${senior ? ", or a reverse mortgage" : ""} may close the gap.`,
        `${usd(need)} es unos ${usd(need - available)} más que este estimado. Una cantidad menor por ahora, un programa que permita más${senior ? " o una hipoteca inversa" : ""} pueden cubrir la diferencia.`,
      ),
    );
  if (debt)
    notes.push(
      t(
        "Paying off debt with your home turns unsecured debt into debt secured by your house. We'll compare the total cost, not just the payment.",
        "Pagar deudas con su casa convierte deudas sin garantía en deudas garantizadas por su casa. Compararemos el costo total, no solo el pago.",
      ),
    );

  return {
    goal: "cash",
    figure: {
      label: t("Your home could unlock", "Su casa podría liberar"),
      value: usd(available),
      math: `${usd(value)} × ${pct(pricing.maxCLTV.heloc)} − ${usd(balance)}`,
    },
    extra: [
      { label: t("Cash you need", "Dinero que necesita"), value: usd(need) },
      {
        label: t(
          "Total borrowing as a share of value",
          "Total de deuda como parte del valor",
        ),
        value: pct(cltv),
      },
    ],
    notes,
    programs,
    checklist: docs(a, [
      t(
        "Your latest mortgage statement",
        "Su estado de cuenta hipotecario más reciente",
      ),
      t(
        "Your homeowners insurance declarations page",
        "La página de declaraciones de su seguro de vivienda",
      ),
      ...(debt
        ? [
            t(
              "Recent statements for the debts you want to pay off",
              "Estados de cuenta recientes de las deudas que quiere pagar",
            ),
          ]
        : []),
    ]),
    reads: [
      ans(
        "heloc-vs-cash-out-refinance",
        "HELOC or cash-out refinance?",
        "¿HELOC o refinanciamiento con retiro de efectivo?",
      ),
      ans(
        "how-much-can-i-borrow-heloc",
        "How much can I borrow with a HELOC?",
        "¿Cuánto puedo pedir con una HELOC?",
      ),
      ...(debt
        ? [
            ans(
              "risks-of-secured-debt-consolidation",
              "The risks of consolidating debt with your home",
              "Los riesgos de consolidar deudas con su casa",
            ),
          ]
        : []),
      ...(senior
        ? [
            ans(
              "reverse-mortgage-second-vs-heloc",
              "Reverse mortgage second or HELOC?",
              "¿Hipoteca inversa de segundo gravamen o HELOC?",
            ),
          ]
        : []),
    ],
    booking: "equity",
    disclosures: {
      products: ["heloc", ...(senior ? (["reverse-second"] as const) : [])],
      debt,
    },
    summary: `Cash from home: needs ${usd(need)} for ${a.purpose}, value ${usd(value)}, owes ${usd(balance)}, rate ${a.currentRate}, est. available ${usd(available)} (${fits ? "fits" : "short " + usd(need - available)}), 62+: ${a.over62}. Fits: ${programs.map((p) => p.name.en).join(", ")}.`,
  };
}

function reverseResult(a: Answers): Result {
  const value = num(a, "homeValue");
  const balance = num(a, "balance");
  const age = num(a, "age");
  const e: ReverseEstimate = estimateReverse({ zip: "", value, balance, age });
  const keep = a.keepFirst === "yes";
  const notes: Text[] = [];
  const programs: Program[] = [];
  const range = (r: [number, number]) =>
    r[1] <= 0 ? usd(0) : `${usd(Math.max(0, r[0]))} – ${usd(r[1])}`;

  if (e.fit === "too-young") {
    notes.push(
      t(
        `FHA-insured reverse mortgages (HECMs) start at ${MIN_AGE}. If one spouse is younger, the older spouse may still qualify, with protections for the younger spouse.`,
        `Las hipotecas inversas aseguradas por la FHA (HECM) empiezan a los ${MIN_AGE} años. Si un cónyuge es más joven, el mayor todavía puede calificar, con protecciones para el más joven.`,
      ),
    );
    programs.push({
      name: t(
        "Proprietary reverse mortgage (some start at 55)",
        "Hipoteca inversa propietaria (algunas desde los 55)",
      ),
      why: t(
        "Some private programs start younger in certain states. They are not FHA-insured.",
        "Algunos programas privados empiezan a menor edad en ciertos estados. No están asegurados por la FHA.",
      ),
    });
  } else {
    const short = e.fit === "not-enough-equity";
    if (!keep && !short)
      programs.push({
        name: t(
          "HECM reverse mortgage (FHA-insured)",
          "Hipoteca inversa HECM (asegurada por la FHA)",
        ),
        why: t(
          "Pays off your current mortgage and gives you a line of credit, monthly income, or a mix.",
          "Paga su hipoteca actual y le da una línea de crédito, un ingreso mensual o una combinación.",
        ),
      });
    if (keep || a.keepFirst === "unsure" || short)
      programs.push({
        name: t(
          "Reverse mortgage second",
          "Hipoteca inversa de segundo gravamen",
        ),
        why: t(
          "Keep your current mortgage and rate, and get cash or a line of credit with no required monthly payment.",
          "Conserve su hipoteca y su tasa actuales, y obtenga efectivo o una línea de crédito sin pago mensual obligatorio.",
        ),
      });
    if (value > pricing.hecm.maxClaimAmount)
      programs.push({
        name: t("Jumbo reverse mortgage", "Hipoteca inversa jumbo"),
        why: t(
          `Your home is above FHA's ${usd(pricing.hecm.maxClaimAmount)} limit, so a private jumbo program may provide more.`,
          `Su casa está por encima del límite de la FHA de ${usd(pricing.hecm.maxClaimAmount)}, así que un programa jumbo privado podría darle más.`,
        ),
      });
    if (short)
      programs.push({
        name: t("Other ways to lower your payment", "Otras formas de bajar su pago"),
        why: t(
          "A refinance, a HELOC, or a mix may fit better. We'll compare them side by side.",
          "Un refinanciamiento, una HELOC o una combinación pueden funcionar mejor. Las compararemos lado a lado.",
        ),
      });
    if (short)
      notes.push(
        t(
          "Your mortgage balance is higher than this estimate, so a HECM may not cover it. A reverse mortgage second or other options may still work.",
          "Su saldo hipotecario es mayor que este estimado, así que una HECM quizá no lo cubra. Una hipoteca inversa de segundo gravamen u otras opciones todavía pueden funcionar.",
        ),
      );
    if (balance > 0 && !keep)
      notes.push(
        t(
          `This estimate already subtracts your ${usd(balance)} mortgage payoff and estimated costs.`,
          `Este estimado ya resta el pago de su hipoteca de ${usd(balance)} y los costos estimados.`,
        ),
      );
    if (balance > 0 && keep)
      notes.push(
        t(
          "This figure is for a standard HECM, which pays off your current mortgage. A reverse mortgage second leaves your mortgage in place and is priced differently; we'll run those numbers on the call.",
          "Esta cifra es para una HECM estándar, que paga su hipoteca actual. Una hipoteca inversa de segundo gravamen deja su hipoteca como está y se calcula de otra forma; haremos esos números en la llamada.",
        ),
      );
    if (e.arm.firstYearCap)
      notes.push(
        t(
          `In the first 12 months, HUD limits how much you can take, about ${usd(e.arm.firstYearCap)} in your case. The rest is available after that.`,
          `En los primeros 12 meses, HUD limita cuánto puede retirar: cerca de ${usd(e.arm.firstYearCap)} en su caso. El resto queda disponible después.`,
        ),
      );
    notes.push(
      t(
        "You keep the title. You still pay property taxes, insurance, and upkeep, and the loan balance grows over time.",
        "Usted conserva el título. Sigue pagando impuestos a la propiedad, seguro y mantenimiento, y el saldo del préstamo crece con el tiempo.",
      ),
    );
  }

  return {
    goal: "reverse",
    figure:
      e.fit === "too-young"
        ? undefined
        : {
            label: t(
              "Estimated amount available (HECM, adjustable)",
              "Monto estimado disponible (HECM, ajustable)",
            ),
            value: range(e.arm.available),
          },
    extra:
      e.fit === "too-young"
        ? []
        : [
            {
              label: t(
                "If taken as one lump sum (fixed rate)",
                "Si lo recibe todo de una vez (tasa fija)",
              ),
              value: range(e.fixed.available),
            },
            {
              label: t("Estimated upfront costs", "Costos iniciales estimados"),
              value: range(e.costs),
            },
          ],
    notes,
    programs,
    checklist: docs(a, [
      t(
        "Your latest mortgage statement (if you have one)",
        "Su estado de cuenta hipotecario más reciente (si tiene)",
      ),
      t(
        "Your property tax bill and homeowners insurance declarations page",
        "Su recibo de impuestos a la propiedad y la página de declaraciones de su seguro",
      ),
      t(
        "A HUD-approved counseling session (required; we'll help you schedule it)",
        "Una sesión de asesoría aprobada por HUD (obligatoria; le ayudamos a programarla)",
      ),
    ]),
    reads: [
      {
        href: "/reverse-calculator",
        label: t(
          "See the full reverse mortgage calculator",
          "Vea la calculadora completa de hipoteca inversa",
        ),
      },
      ans(
        "who-qualifies-for-a-reverse-mortgage",
        "Who qualifies for a reverse mortgage?",
        "¿Quién califica para una hipoteca inversa?",
      ),
      ...(keep
        ? [
            ans(
              "reverse-mortgage-keep-first-mortgage",
              "Can I keep my first mortgage?",
              "¿Puedo conservar mi primera hipoteca?",
            ),
          ]
        : []),
      ...(e.fit === "too-young"
        ? [
            ans(
              "reverse-mortgage-spouse-under-62",
              "What if my spouse is under 62?",
              "¿Y si mi cónyuge tiene menos de 62?",
            ),
          ]
        : []),
      ans(
        "reverse-mortgage-alternatives",
        "Alternatives to a reverse mortgage",
        "Alternativas a la hipoteca inversa",
      ),
    ],
    booking: "reverse",
    disclosures: {
      products: [
        "hecm",
        ...(programs.some(
          (p) => p.name.en !== "HECM reverse mortgage (FHA-insured)",
        )
          ? (["reverse-second"] as const)
          : []),
      ],
    },
    summary: `Reverse: youngest age ${age}, value ${usd(value)}, owes ${usd(balance)}, goal ${a.reverseGoal}, keep first: ${a.keepFirst ?? "n/a"}, fit ${e.fit}, HECM est. ${range(e.arm.available)}, lump sum ${range(e.fixed.available)}.`,
  };
}

export function resultFor(a: Answers): Result {
  switch (a.goal as Goal) {
    case "buy":
      return buyResult(a);
    case "refi":
      return refiResult(a);
    case "cash":
      return cashResult(a);
    default:
      return reverseResult(a);
  }
}

/** Plain-English list of every answer, for the Go High Level note. */
export function answerLines(a: Answers): string[] {
  return questionsFor(a)
    .filter((q) => a[q.id] !== undefined && a[q.id] !== "")
    .map((q) => {
      const v = a[q.id];
      const shown =
        q.kind === "money"
          ? `${usd(Number(v))}${q.perMonth ? "/mo" : ""}`
          : optionLabel(q, v, "en");
      return `${q.title.en} ${shown}`;
    });
}
