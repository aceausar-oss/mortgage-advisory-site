import type { Metadata } from "next";
import { PreApprovalView } from "@/components/qualify/PreApprovalView";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "How Do I Get Pre-Approved for a Mortgage?",
  description:
    "Share your income, assets, and debts, and let a lender verify them. Documents, timing, credit impact, and a 2-minute quiz. CA, TX, FL, CO. NMLS #1549739.",
  alternates: alternates("/pre-approval", "en"),
};

export default function PreApprovalPage() {
  return <PreApprovalView lang="en" />;
}
