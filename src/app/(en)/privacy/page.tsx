import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { getContentPage } from "@/lib/pages";

const page = getContentPage("privacy");
export const metadata = contentPageMetadata(page);

export default function PrivacyPage() {
  return <ContentPageView page={page} />;
}
