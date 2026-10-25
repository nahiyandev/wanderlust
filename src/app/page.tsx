import React, { Suspense } from "react";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/hero-search";
import { WhyChooseSection } from "@/components/why-choose-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { CtaSection } from "@/components/cta-section";
import {
  FeaturedDestinations,
  type FeaturedDestinationItem,
} from "@/components/featured-destinations";
import { BACKEND_URL } from "@/lib/backend-url";


type BackendDestination = {
  _id?: string;
  id?: string;
  // Newer backend records:
  destinationName?: string;
  image?: string;
  // Older backend records:
  name?: string;
  imageUrl?: string;
  country?: string;
  category?: string;
  price?: number | string;
  duration?: string;
};

async function getFeatured(): Promise<FeaturedDestinationItem[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/destinations`);
    if (!res.ok) return null;
    const raw = (await res.json()) as BackendDestination[];

    // Featured picks: only sane, presentable records — a real name, an image
    // and a positive price (older test junk records like "??????" excluded).
    const featured = raw
      .filter(
        (item) =>
          /[a-zA-Z]/.test(item.destinationName ?? item.name ?? "") &&
          Boolean(item.image || item.imageUrl) &&
          Number(item.price ?? 0) > 0,
      )
      .slice(0, 12)
      .map<FeaturedDestinationItem>((item) => ({
        id: String(item._id ?? item.id ?? ""),
        name: (item.destinationName ?? item.name ?? "").trim(),
        location: item.country ?? "",
        price: Number(item.price ?? 0),
        duration: item.duration,
        imageUrl: (item.image ?? (item.imageUrl || ""))
          .replace(/w=\d+/, "w=800"),
      }));

    return featured;
  } catch {
    // Backend down — homepage stays silent instead of showing an error banner.
    return null;
  }
}

async function FeaturedSectionData() {
  const featured = await getFeatured();
  if (!featured || featured.length === 0) return null;
  return <FeaturedDestinations destinations={featured} />;
}

function FeaturedFallback() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="h-10 w-72 animate-pulse rounded-md bg-muted" />
            <div className="mt-3 h-4 w-56 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-11 w-44 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="aspect-video w-full animate-pulse rounded-md bg-muted" />
          <div className="aspect-video w-full animate-pulse rounded-md bg-muted max-md:hidden" />
          <div className="aspect-video w-full animate-pulse rounded-md bg-muted max-lg:hidden" />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {  return (
    <>
      <main className="relative isolate flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center px-4 pt-24 pb-36 text-center text-white sm:py-24">
      <Image
        src="/images/Banner.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />

      <div className="max-w-3xl">
        <h1 className="font-heading text-4xl leading-tight font-medium text-balance sm:text-6xl lg:text-7xl">
          Discover Your Next Adventure
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90">
          Explore breathtaking destinations and create unforgettable memories
          with our curated travel experiences.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="h-12 gap-2.5 rounded-md bg-brand px-8 text-sm font-semibold tracking-widest text-white uppercase hover:bg-brand/90"
          >
            Explore Now
            <ArrowRightIcon />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-12 rounded-md border border-white/30 bg-white/30 px-8 text-sm font-semibold tracking-widest text-white uppercase backdrop-blur-sm hover:bg-white/40 hover:text-white dark:border-white/30 dark:bg-white/30 dark:text-white dark:hover:bg-white/40"
          >
            View Destination
          </Button>
        </div>
      </div>

      <HeroSearch />
      </main>

      {/* Featured destinations — real backend data, streamed in */}
      <Suspense fallback={<FeaturedFallback />}>
        <FeaturedSectionData />
      </Suspense>

      <WhyChooseSection />

      <TestimonialsSection />

      <CtaSection />
    </>
  );
}
