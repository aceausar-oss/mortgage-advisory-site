import Image from "next/image";
import { AnswerCta } from "@/components/AnswerParts";
import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { ReviewsSummary } from "@/components/Reviews";
import { getContentPage } from "@/lib/pages";
import { licensing } from "@/lib/site";

const page = getContentPage("about");
export const metadata = contentPageMetadata(page);

export default function AboutPage() {
  return (
    <ContentPageView
      page={page}
      top={
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-white p-6 ring-1 ring-brand-blue/40 sm:flex-row sm:items-center">
          <Image
            src={licensing.founder.image}
            alt={`${licensing.founder.name}, founder of ${licensing.brandName}`}
            width={578}
            height={914}
            sizes="160px"
            className="h-40 w-40 shrink-0 rounded-full bg-white object-cover object-top"
          />
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-heading text-2xl font-bold text-brand-ink">{licensing.founder.name}</p>
            <p className="text-brand-slate">
              {licensing.founder.jobTitle} · Founder, {licensing.legalName}
            </p>
            <p className="text-brand-slate">NMLS #{licensing.nmls}</p>
            <div className="pt-2">
              <ReviewsSummary />
            </div>
          </div>
        </div>
      }
      bottom={<AnswerCta />}
    />
  );
}
