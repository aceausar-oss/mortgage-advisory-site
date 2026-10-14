import { LOAN_SLUGS } from "@/lib/loanSlugs";

// Spanish version of the site (Ace, Oct 2026). Spanish pages live under /es with the same paths as their English
// twins (/loans/heloc ↔ /es/loans/heloc), so the EN/ES toggle and hreflang tags can map one to the other.
export type Lang = "en" | "es";

/** Cookie that remembers the visitor's language choice (set by src/proxy.ts). */
export const LANG_COOKIE = "lang";

// English paths that have a Spanish twin under /es. Anything else toggles to the Spanish homepage.
export const SPANISH_PATHS: string[] = ["/", "/ask", "/book", ...LOAN_SLUGS.map((s) => `/loans/${s}`)];

/** "/loans/heloc" → "/es/loans/heloc"; "/" → "/es". */
export const toEs = (path: string) => (path === "/" ? "/es" : `/es${path}`);

/** "/es/loans/heloc" → "/loans/heloc"; "/es" → "/". */
export const toEn = (path: string) => path.replace(/^\/es(?=\/|$)/, "") || "/";

/** Page link in the reader's language: href("/book", "es") → "/es/book". Only for pages that have a Spanish twin. */
export const href = (path: string, lang: Lang) => {
  if (lang === "en") return path;
  const [base, hash] = path.split("#");
  const bare = base.split("?")[0] || "/";
  if (!SPANISH_PATHS.includes(bare)) return path; // English-only page: link stays English
  return `${toEs(base || "/")}${hash !== undefined ? `#${hash}` : ""}`;
};

/** Metadata `alternates` for a page that exists in both languages (hreflang en / es / x-default). */
export function alternates(enPath: string, lang: Lang) {
  return {
    canonical: lang === "es" ? toEs(enPath) : enPath,
    languages: { "en-US": enPath, "es-US": toEs(enPath), "x-default": enPath },
  };
}

// Interface text. Page content (loan pages, etc.) lives in content/ and content/es/.
export const ui = {
  en: {
    skip: "Skip to content",
    home: "home",
    menu: "Menu",
    resources: "Resources",
    call: "Call",
    book: "Book a call",
    bookShort: "Book a call",
    bookAdvisor: "Book a call with an advisor",
    switchTo: "Español",
    switchLabel: "Ver esta página en español",
    directLender: "Direct lender & mortgage broker",
    licensedIn: "Licensed in",
    see: "see",
    licensingLink: "Licensing & Disclosures",
    equalHousing: "Equal Housing Lender",
    loansGroup: "Loans",
    whereGroup: "Where we lend",
    companyGroup: "Company & tools",
    legal: "Legal",
    notCommitment:
      "This is not a commitment to lend. All loans subject to credit approval, underwriting, and property valuation. Rates, terms, and programs subject to change without notice.",
    rights: "All rights reserved.",
    englishOnly: "",
  },
  es: {
    skip: "Ir al contenido",
    home: "inicio",
    menu: "Menú",
    resources: "Recursos",
    call: "Llame al",
    book: "Reservar llamada",
    bookShort: "Reservar",
    bookAdvisor: "Reserve una llamada con un asesor",
    switchTo: "English",
    switchLabel: "View this page in English",
    directLender: "Prestamista directo y corredor hipotecario",
    licensedIn: "Con licencia en",
    see: "vea",
    licensingLink: "Licencias y divulgaciones (en inglés)",
    equalHousing: "Prestamista con igualdad de oportunidades de vivienda",
    loansGroup: "Préstamos",
    whereGroup: "Dónde prestamos (en inglés)",
    companyGroup: "Empresa y herramientas (en inglés)",
    legal: "Información legal (en inglés)",
    notCommitment:
      "Esto no es un compromiso de préstamo. Todos los préstamos están sujetos a aprobación de crédito, suscripción y valuación de la propiedad. Las tasas, los términos y los programas pueden cambiar sin previo aviso.",
    rights: "Todos los derechos reservados.",
    englishOnly: " (en inglés)",
  },
} as const;

export const spanishNav = [
  { href: "/es/loans/purchase", label: "Comprar casa" },
  { href: "/es/loans/refinance", label: "Refinanciar" },
  { href: "/es/loans/heloc", label: "HELOC y capital" },
  { href: "/es/loans/reverse-mortgage", label: "Hipoteca inversa" },
];

export const spanishResourcesNav = [
  { href: "/es/loans/fha", label: "Préstamos FHA" },
  { href: "/es/loans/va", label: "Préstamos VA" },
  { href: "/es/loans/conventional", label: "Préstamos convencionales" },
  { href: "/es/loans/non-qm", label: "Préstamos Non-QM" },
  { href: "/es/loans/debt-consolidation", label: "Consolidar deudas" },
  { href: "/es/ask", label: "Pregúntele al asistente" },
  { href: "/es/book", label: "Reservar una llamada" },
];

export const spanishLegalNav = [
  { href: "/privacy", label: "Política de privacidad" },
  { href: "/terms", label: "Términos" },
  { href: "/accessibility", label: "Accesibilidad" },
  { href: "/licensing", label: "Licencias y divulgaciones" },
  { href: "/do-not-sell", label: "No vender ni compartir mi información personal" },
];
