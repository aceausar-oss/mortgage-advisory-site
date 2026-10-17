import type { Metadata } from "next";
import { PreApprovalView } from "@/components/qualify/PreApprovalView";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "¿Cómo obtengo una preaprobación hipotecaria?",
  description:
    "Comparta sus ingresos, bienes y deudas, y deje que un prestamista los verifique. Documentos, tiempos, efecto en su crédito y un cuestionario de 2 minutos.",
  alternates: alternates("/pre-approval", "es"),
};

export default function SpanishPreApprovalPage() {
  return <PreApprovalView lang="es" />;
}
