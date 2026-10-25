import { HeadsetIcon, MapIcon, ShieldCheckIcon } from "lucide-react";

const CARDS = [
  {
    icon: ShieldCheckIcon,
    title: "Safe & Secure",
    description:
      "Your safety is our priority with comprehensive travel insurance and 24/7 support.",
  },
  {
    icon: MapIcon,
    title: "Expert Guides",
    description:
      "Local experts who bring destinations to life with authentic cultural insights.",
  },
  {
    icon: HeadsetIcon,
    title: "24/7 Support",
    description:
      "Round-the-clock customer service to assist you wherever your journey takes you.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="bg-brand-soft px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-heading text-3xl text-balance sm:text-5xl">
          Why Choose Wanderlust
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground sm:text-base">
          Your trusted partner for exceptional travel experiences
        </p>

        <div className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-md bg-card p-8 shadow-sm"
            >
              <card.icon className="size-9 text-brand" aria-hidden />
              <h3 className="mt-5 font-heading text-2xl">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
