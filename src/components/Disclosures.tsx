import type { KbEntry } from "@/lib/kb";
import type { Lang } from "@/lib/i18n";
import { licensing } from "@/lib/site";

// Spanish wording of each disclosure (Ace, Oct 2026). Keep each one saying exactly what its English twin says.
const ES: Record<string, string> = {
  "This material has not been reviewed, approved, or issued by HUD, FHA, or any government agency.":
    "Este material no ha sido revisado, aprobado ni emitido por HUD, la FHA ni ninguna agencia del gobierno.",
  "With a reverse mortgage, borrowers must continue to pay property taxes and homeowners insurance and maintain the home. The loan becomes due when the last borrower no longer lives in the home as a primary residence, sells the home, or does not meet the loan terms.":
    "Con una hipoteca inversa, los prestatarios deben seguir pagando los impuestos a la propiedad y el seguro de la vivienda, y mantener la casa. El préstamo se vence cuando el último prestatario ya no vive en la casa como residencia principal, vende la casa o no cumple con los términos del préstamo.",
  "Proprietary reverse mortgages, including second-lien reverse mortgages, are not FHA-insured Home Equity Conversion Mortgages (HECMs). Terms, eligibility, and availability vary by program and state.":
    "Las hipotecas inversas propietarias, incluidas las hipotecas inversas de segundo gravamen, no son Hipotecas de Conversión del Valor Líquido de la Vivienda (HECM) aseguradas por la FHA. Los términos, la elegibilidad y la disponibilidad varían según el programa y el estado.",
  "The HomeSafe reverse mortgage is a proprietary product of Finance of America Reverse LLC and is not related to the Home Equity Conversion Mortgage (HECM) program. HomeSafe products are only available in certain states.":
    "La hipoteca inversa HomeSafe es un producto propietario de Finance of America Reverse LLC y no está relacionada con el programa de Hipotecas de Conversión del Valor Líquido de la Vivienda (HECM). Los productos HomeSafe solo están disponibles en ciertos estados.",
  "HELOC rates may be fixed or variable depending on the program. A variable rate is based on an index plus a margin and can change over time, which changes your payment. Fees, draw requirements, and early closure fees may apply. Your home secures the line of credit.":
    "Las tasas de una HELOC pueden ser fijas o variables, según el programa. Una tasa variable se basa en un índice más un margen y puede cambiar con el tiempo, lo que cambia su pago. Pueden aplicarse cargos, requisitos de retiro y cargos por cierre anticipado. Su casa garantiza la línea de crédito.",
  "Using home equity to pay off debt turns unsecured debt into debt secured by your home. If you don't make the payments, you could lose your home. Spreading debt over a longer term can increase the total interest you pay.":
    "Usar el valor líquido (equity) de su casa para pagar deudas convierte deudas sin garantía en deudas garantizadas por su casa. Si no hace los pagos, podría perder su casa. Repartir una deuda en un plazo más largo puede aumentar el total de intereses que paga.",
  "The Mortgage Advisory is not affiliated with or endorsed by the U.S. Department of Veterans Affairs.":
    "The Mortgage Advisory no está afiliada ni respaldada por el Departamento de Asuntos de Veteranos de los EE. UU. (VA).",
  "The Mortgage Advisory is not affiliated with or endorsed by HUD or the Federal Housing Administration.":
    "The Mortgage Advisory no está afiliada ni respaldada por HUD ni por la Administración Federal de Vivienda (FHA).",
  "This is general information, not a commitment to lend. All loans are subject to credit approval, underwriting, and property valuation.":
    "Esta es información general, no un compromiso de préstamo. Todos los préstamos están sujetos a aprobación de crédito, suscripción y valuación de la propiedad.",
};

// Topic-specific advertising disclosures (CLAUDE.md §8). Shown on every answer page that touches the topic.
export function Disclosures({
  entry,
  debt: debtTopic = false,
  lang = "en",
}: {
  lang?: Lang;
  entry: Pick<KbEntry, "category" | "products"> & { affiliate?: boolean };
  debt?: boolean;
}) {
  const has = (p: KbEntry["products"][number]) => entry.products.includes(p);
  const reverse = entry.category === "reverse-mortgage" || has("hecm") || has("proprietary-reverse") || has("reverse-second") || has("homesafe");
  const proprietary = has("proprietary-reverse") || has("reverse-second") || has("homesafe");
  const heloc = has("heloc");
  const debt = debtTopic || entry.category === "debt-consolidation";
  const items: string[] = [];

  if (reverse) {
    items.push(
      "This material has not been reviewed, approved, or issued by HUD, FHA, or any government agency.",
      "With a reverse mortgage, borrowers must continue to pay property taxes and homeowners insurance and maintain the home. The loan becomes due when the last borrower no longer lives in the home as a primary residence, sells the home, or does not meet the loan terms.",
    );
  }
  if (proprietary) {
    items.push(
      "Proprietary reverse mortgages, including second-lien reverse mortgages, are not FHA-insured Home Equity Conversion Mortgages (HECMs). Terms, eligibility, and availability vary by program and state.",
    );
  }
  if (has("homesafe")) {
    items.push(
      "The HomeSafe reverse mortgage is a proprietary product of Finance of America Reverse LLC and is not related to the Home Equity Conversion Mortgage (HECM) program. HomeSafe products are only available in certain states.",
    );
  }
  if (heloc) {
    items.push(
      "HELOC rates may be fixed or variable depending on the program. A variable rate is based on an index plus a margin and can change over time, which changes your payment. Fees, draw requirements, and early closure fees may apply. Your home secures the line of credit.",
    );
  }
  if (debt) {
    items.push(
      "Using home equity to pay off debt turns unsecured debt into debt secured by your home. If you don't make the payments, you could lose your home. Spreading debt over a longer term can increase the total interest you pay.",
    );
  }
  if (has("va")) {
    items.push("The Mortgage Advisory is not affiliated with or endorsed by the U.S. Department of Veterans Affairs.");
  }
  if (has("fha")) {
    items.push("The Mortgage Advisory is not affiliated with or endorsed by HUD or the Federal Housing Administration.");
  }
  if (entry.affiliate) {
    for (const aff of licensing.affiliates) items.push(aff.disclosure);
  }
  items.push("This is general information, not a commitment to lend. All loans are subject to credit approval, underwriting, and property valuation.");

  const title = lang === "es" ? "Divulgaciones importantes" : "Important disclosures";
  return (
    <aside aria-label={title} className="rounded-2xl border border-brand-steel/40 bg-white p-5 text-sm leading-relaxed">
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((t) => {
          // A disclosure with no Spanish version in ES above stays in English (marked so) rather than being machine-translated.
          const es = lang === "es" ? ES[t] : undefined;
          return (
            <li key={t} lang={lang === "es" && !es ? "en" : undefined}>
              {es ?? t}
              {lang === "es" && !es && " (en inglés)"}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
