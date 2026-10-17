import type { Metadata } from "next";
import {
  QualifyPageView,
  goalFrom,
} from "@/components/qualify/QualifyPageView";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Vea para qué califica: cuestionario hipotecario de 2 minutos",
  description:
    "¿Comprar, refinanciar, una HELOC o una hipoteca inversa? Conteste unas preguntas y vea opciones que pueden funcionarle. Sin revisar su crédito ni SSN.",
  alternates: alternates("/qualify", "es"),
};

export default async function SpanishQualifyPage({
  searchParams,
}: PageProps<"/es/qualify">) {
  const sp = await searchParams;
  return <QualifyPageView lang="es" goal={goalFrom(sp.goal)} />;
}
