import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { getContentPage } from "@/lib/pages";

const page = getContentPage("accessibility");
export const metadata = contentPageMetadata(page);

export default function AccessibilityPage() {
  return <ContentPageView page={page} />;
}
