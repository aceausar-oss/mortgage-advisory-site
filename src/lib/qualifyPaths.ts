import type { Lang } from "@/lib/i18n";
import type { Goal } from "@/lib/qualify";

// Shareable quiz links for each homeowner path (Ace, Oct 2026): /qualify/refinance, /qualify/heloc,
// /qualify/reverse-mortgage (and /es/...). Each opens the quiz on that path and has its own title and link-preview
// photo, so a link texted to a client previews the right topic. Buyers use /pre-approval instead.
// Photos match each loan page; Spanish previews use the Latino homeowner couple, like the Spanish loan pages.

type Copy = { photoAlt: string; crumb: string; h1: string; lead: string; title: string; description: string; share: string; shareSub: string };

export type QualifyPath = {
  slug: "refinance" | "heloc" | "reverse-mortgage";
  goal: Goal;
  photo: string;
  position: string;
  photoEs: string;
  positionEs: string;
  en: Copy;
  es: Copy;
};

const COUPLE = { photoEs: "/images/loans/loan-reverse-mortgage.jpg", positionEs: "20% center" };

export const QUALIFY_PATHS: QualifyPath[] = [
  {
    slug: "refinance",
    goal: "refi",
    photo: "/images/loans/loan-refinance.jpg",
    position: "center 25%",
    ...COUPLE,
    en: {
      photoAlt: "Couple at the dining table reviewing their numbers with a calculator",
      crumb: "Refinance quiz",
      h1: "Is a refinance worth it for you?",
      lead: "Answer a few quick questions about your current loan and your goal. You'll see which refinance options fit, your equity today, and what to have ready.",
      title: "Is a Refinance Worth It? 2-Minute Quiz",
      description: "See which refinance fits your loan and goal: lower payment, drop mortgage insurance, shorter term, or a fixed rate. No credit check. NMLS #1549739.",
      share: "Is a refinance worth it for you?",
      shareSub: "2-minute quiz · No credit check",
    },
    es: {
      photoAlt: "Pareja de propietarios sonriendo en su patio",
      crumb: "Cuestionario de refinanciamiento",
      h1: "¿Le conviene refinanciar?",
      lead: "Conteste unas preguntas rápidas sobre su préstamo actual y su objetivo. Verá qué opciones de refinanciamiento le funcionan, su valor líquido hoy y qué tener listo.",
      title: "¿Le conviene refinanciar? Cuestionario de 2 minutos",
      description: "Vea qué refinanciamiento va con su préstamo y su objetivo: bajar el pago, quitar el seguro hipotecario, un plazo más corto o tasa fija. Sin revisar su crédito.",
      share: "¿Le conviene refinanciar?",
      shareSub: "Cuestionario de 2 minutos · Sin revisar su crédito",
    },
  },
  {
    slug: "heloc",
    goal: "cash",
    photo: "/images/loans/loan-heloc.jpg",
    position: "center",
    ...COUPLE,
    en: {
      photoAlt: "Homeowner and contractor reviewing plans for a new backyard addition",
      crumb: "Home equity quiz",
      h1: "How much cash could your home unlock?",
      lead: "Answer a few quick questions to see your estimated available equity and whether a HELOC or a cash-out refinance fits better, without giving up a low rate you already have.",
      title: "How Much Could Your Home Unlock? HELOC Quiz",
      description: "See your estimated available equity and whether a HELOC or cash-out refinance fits better. 2 minutes, no credit check. CA, TX, FL, CO. NMLS #1549739.",
      share: "How much cash could your home unlock?",
      shareSub: "HELOC or cash-out · 2-minute quiz",
    },
    es: {
      photoAlt: "Pareja de propietarios sonriendo en su patio",
      crumb: "Cuestionario de valor líquido",
      h1: "¿Cuánto dinero podría liberar su casa?",
      lead: "Conteste unas preguntas rápidas para ver su valor líquido disponible estimado y si le conviene más una HELOC o un refinanciamiento con retiro de efectivo, sin perder la tasa baja que ya tiene.",
      title: "¿Cuánto podría liberar su casa? Cuestionario HELOC",
      description: "Vea su valor líquido disponible estimado y si le conviene más una HELOC o un refinanciamiento con retiro de efectivo. 2 minutos, sin revisar su crédito.",
      share: "¿Cuánto dinero podría liberar su casa?",
      shareSub: "HELOC o retiro de efectivo · 2 minutos",
    },
  },
  {
    slug: "reverse-mortgage",
    goal: "reverse",
    photo: "/images/loans/loan-reverse-mortgage.jpg",
    position: "20% center",
    ...COUPLE,
    en: {
      photoAlt: "Retired couple smiling in their backyard",
      crumb: "Reverse mortgage quiz",
      h1: "See your reverse mortgage estimate",
      lead: "For homeowners 62 and older. Answer a few quick questions to see an estimated range based on HUD's official tables, options to keep your current mortgage, and what to have ready.",
      title: "Reverse Mortgage Estimate: 2-Minute Quiz",
      description: "Homeowners 62+: see an estimated reverse mortgage range from HUD's tables, plus options to keep your current mortgage. No credit check. NMLS #1549739.",
      share: "See your reverse mortgage estimate",
      shareSub: "Homeowners 62+ · 2-minute quiz",
    },
    es: {
      photoAlt: "Pareja jubilada sonriendo en su patio",
      crumb: "Cuestionario de hipoteca inversa",
      h1: "Vea su estimado de hipoteca inversa",
      lead: "Para propietarios de 62 años o más. Conteste unas preguntas rápidas para ver un rango estimado basado en las tablas oficiales de HUD, opciones para conservar su hipoteca actual y qué tener listo.",
      title: "Estimado de hipoteca inversa: cuestionario de 2 minutos",
      description: "Propietarios de 62 años o más: vea un rango estimado de hipoteca inversa con las tablas de HUD y opciones para conservar su hipoteca actual. Sin revisar su crédito.",
      share: "Vea su estimado de hipoteca inversa",
      shareSub: "Propietarios de 62+ · Cuestionario de 2 minutos",
    },
  },
];

export const qualifyPath = (slug: string) => QUALIFY_PATHS.find((p) => p.slug === slug);

/** Where to send a visitor for a goal: buyers to /pre-approval, everyone else to their quiz link. */
export function quizHref(goal: Goal | undefined, lang: Lang) {
  const pre = lang === "es" ? "/es" : "";
  if (goal === "buy") return `${pre}/pre-approval`;
  const p = QUALIFY_PATHS.find((x) => x.goal === goal);
  return p ? `${pre}/qualify/${p.slug}` : `${pre}/qualify`;
}
