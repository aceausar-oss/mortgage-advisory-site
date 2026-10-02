import Image from "next/image";
import Link from "next/link";

// Amex-style photo cards: photo on top with a charcoal label chip, white text box below. Each links to its program page.
// Photos are illustrations only (never presented as real clients).
const GOALS = [
  {
    href: "/loans/heloc",
    image: "/images/goals/goal-heloc-photo.jpg",
    alt: "Couple at the dining table reviewing their numbers with a calculator",
    label: "Keep your low rate",
    title: "Tap your equity",
    text: "Get cash for a remodel, college, or a cushion without refinancing your first mortgage.",
  },
  {
    href: "/loans/reverse-mortgage",
    image: "/images/goals/goal-reverse-photo.jpg",
    alt: "Retired couple relaxing on their porch",
    label: "For homeowners 62+",
    title: "Retire in the home you love",
    text: "Turn equity into cash or a growing line of credit with no required monthly mortgage payment. Taxes, insurance, and upkeep still apply.",
  },
  {
    href: "/loans/purchase",
    image: "/images/goals/goal-buy-photo.jpg",
    alt: "Young family at their front door holding house keys",
    label: "FHA · VA · Conventional",
    title: "Buy your next home",
    text: "Get pre-approved and compare conventional, FHA, and VA loans side by side, with every cost upfront.",
  },
  {
    href: "/life-rate",
    image: "/images/goals/goal-debt-photo.jpg",
    alt: "Relieved couple at the kitchen table with a laptop and paperwork",
    label: "Lower your Life Rate",
    title: "Get out from under high-interest debt",
    text: "See the blended rate on everything you owe, then a plan to lower it, with the total cost shown first.",
  },
];

export function GoalCards() {
  return (
    <section aria-labelledby="goals-cards-heading" className="relative px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-center font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">Explore by goal</p>
        <h2 id="goals-cards-heading" className="mt-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What would you like your home to do for you?
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GOALS.map((g) => (
            <li key={g.href}>
              <Link
                href={g.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-lg"
              >
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={g.image}
                    alt={g.alt}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-0 left-0 bg-charcoal px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                    {g.label}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold leading-snug">{g.title}</h3>
                  <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed">{g.text}</p>
                  <span className="mt-4 font-semibold text-brand-button">
                    Learn more <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
