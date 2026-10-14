import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { getContentPage } from "@/lib/pages";

const page = getContentPage("terms");
export const metadata = contentPageMetadata(page);

export default function TermsPage() {
  return <ContentPageView page={page} />;
}
