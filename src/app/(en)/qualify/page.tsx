import type { Metadata } from "next";
import {
  QualifyPageView,
  goalFrom,
} from "@/components/qualify/QualifyPageView";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "See What You Qualify For: 2-Minute Mortgage Quiz",
  description:
    "Buying, refinancing, a HELOC, or a reverse mortgage? Answer a few questions and see loan options that may fit. No credit check, no SSN. NMLS #1549739.",
  alternates: alternates("/qualify", "en"),
};

export default async function QualifyPage({
  searchParams,
}: PageProps<"/qualify">) {
  const sp = await searchParams;
  return <QualifyPageView lang="en" goal={goalFrom(sp.goal)} />;
}
