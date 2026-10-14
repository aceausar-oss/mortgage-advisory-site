import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { getContentPage } from "@/lib/pages";

const page = getContentPage("do-not-sell");
export const metadata = contentPageMetadata(page);

export default function DoNotSellPage() {
  return <ContentPageView page={page} />;
}
