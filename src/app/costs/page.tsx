import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { AnswerCta } from "@/components/AnswerParts";
import { TreasuryChart } from "@/components/TreasuryChart";
import { getContentPage } from "@/lib/pages";

// Pricing hub (CLAUDE.md §9). No rate scenarios at launch (Ace's decision); fees as typical ranges only.
const page = getContentPage("costs");
export const metadata = contentPageMetadata(page);

export default function CostsPage() {
  return (
    <ContentPageView
      page={page}
      bottom={
        <>
          <TreasuryChart idPrefix="costs-tsy" />
          <AnswerCta />
        </>
      }
    />
  );
}
