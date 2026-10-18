"use client";

import { useState } from "react";
import { ParallaxImage } from "@/components/ParallaxImage";
import { QualifyQuiz } from "@/components/qualify/QualifyQuiz";
import type { Lang } from "@/lib/i18n";
import type { Goal } from "@/lib/qualify";

// Pre-approval page (Ace, Oct 2026): the banner starts with the neutral family; once the visitor picks an option,
// it changes to that option's photo (same photos as the loan pages). Plain text buttons for the options themselves.
type Photo = { src: string; position: string; alt: { en: string; es: string } };

const GOAL_PHOTOS: Record<Goal, Photo & { srcEs?: string }> = {
  buy: {
    src: "/images/first-home-family.jpg",
    srcEs: "/images/es-buyers-family.jpg",
    position: "center 30%",
    alt: {
      en: "Family holding the keys to their new home",
      es: "Familia con las llaves de su casa nueva",
    },
  },
  refi: {
    src: "/images/loans/loan-refinance.jpg",
    position: "center 25%",
    alt: {
      en: "Couple at the dining table reviewing their numbers",
      es: "Pareja en la mesa revisando sus números",
    },
  },
  cash: {
    src: "/images/loans/loan-heloc.jpg",
    position: "center 30%",
    alt: {
      en: "Homeowner and contractor reviewing plans for a home addition",
      es: "Propietaria y contratista revisando los planos de una ampliación",
    },
  },
  reverse: {
    src: "/images/loans/loan-reverse-mortgage.jpg",
    position: "20% 30%",
    alt: {
      en: "Retired couple smiling in their backyard",
      es: "Pareja jubilada sonriendo en su patio",
    },
  },
};

export function QuizWithPhoto({
  lang,
  defaultPhoto,
}: {
  lang: Lang;
  defaultPhoto: Photo;
}) {
  const [goal, setGoal] = useState<Goal | undefined>();
  const pick = goal ? GOAL_PHOTOS[goal] : null;
  const src = pick
    ? lang === "es" && pick.srcEs
      ? pick.srcEs
      : pick.src
    : defaultPhoto.src;
  const photo = pick ?? defaultPhoto;

  return (
    <div className="space-y-6 sm:space-y-8">
      <ParallaxImage
        src={src}
        alt={photo.alt[lang]}
        sizes="(min-width: 768px) 768px, 100vw"
        position={photo.position}
        preload={!pick}
        className="aspect-[3/1] rounded-2xl"
        strength={0.2}
        imageClassName="motion-safe:animate-[fadein_400ms_ease-out]"
      />
      <QualifyQuiz lang={lang} onGoalChange={setGoal} />
    </div>
  );
}
