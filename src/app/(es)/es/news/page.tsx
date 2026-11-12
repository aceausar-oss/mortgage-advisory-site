import type { Metadata } from "next";
import { NewsHubView } from "@/components/news/NewsViews";
import { alternates } from "@/lib/i18n";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: "The Advisory Report: noticias semanales de vivienda" },
  description: "Cada lunes: números de vivienda y del mercado con su fuente, datos curiosos y lo que significan para propietarios, compradores, jubilados e inversionistas.",
  alternates: { ...alternates("/news", "es"), types: { "application/rss+xml": "/es/news/rss.xml" } },
  openGraph: { type: "website", url: "/es/news", locale: "es_US" },
};

export default function SpanishNewsPage() {
  return <NewsHubView lang="es" />;
}
