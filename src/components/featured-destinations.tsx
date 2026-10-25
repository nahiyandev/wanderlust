"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export type FeaturedDestinationItem = {
  id: string;
  name: string;
  location: string;
  price: number;
  duration?: string;
  imageUrl?: string;
  rating?: number;
};

export function FeaturedDestinations({
  destinations,
}: {
  destinations: FeaturedDestinationItem[];
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [snapCount, setSnapCount] = React.useState(0);
  const [currentSnap, setCurrentSnap] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const handleSelect = () => setCurrentSnap(api.selectedScrollSnap());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with the Embla API instance
    setSnapCount(api.scrollSnapList().length);
    setCurrentSnap(api.selectedScrollSnap());
    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <section className="bg-background px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl sm:text-5xl">
              Featured Destinations
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Handpicked travel experiences for the adventure seekers
            </p>
          </div>
          <Button
            variant="outline"
            className="h-11 gap-2.5 rounded-md px-6 text-sm font-semibold tracking-wide text-foreground uppercase"
            nativeButton={false}
            render={<Link href="/destinations" />}
          >
            All Destinations
            <ArrowRightIcon aria-hidden />
          </Button>
        </div>

        {/* Cards */}
        <Carousel setApi={setApi} opts={{ loop: false }} className="mt-10">
          <CarouselContent className="-ml-5">
            {destinations.map((destination) => (
              <CarouselItem
                key={destination.id}
                className="pl-5 md:basis-1/2 lg:basis-1/3"
              >
                <article>
                  <div className="relative aspect-video overflow-hidden rounded-md">
                    <Image
                      src={destination.imageUrl ?? "/images/Banner.png"}
                      alt={destination.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      className="object-cover"
                    />
                    {destination.rating !== undefined && (
                      <p className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-foreground shadow-sm">
                        {destination.rating}
                        <StarIcon className="size-3.5 fill-current" aria-hidden />
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid items-start gap-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPinIcon className="size-4 shrink-0" aria-hidden />
                        {destination.location}
                      </p>
                      <h3 className="mt-1.5 font-heading text-xl">
                        {destination.name}
                      </h3>
                      {destination.duration && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarIcon className="size-4 shrink-0" aria-hidden />
                          {destination.duration}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-start justify-between gap-3 sm:items-end">
                      <p className="text-xl font-bold text-foreground">
                        ${destination.price}
                        <span className="text-xs font-normal text-muted-foreground">
                          /Person
                        </span>
                      </p>
                      <Link
                        href={`/destinations/${destination.id}`}
                        className="flex items-center gap-1 text-sm font-semibold text-brand underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                      >
                        BOOK NOW
                        <ArrowUpRightIcon
                          className="size-4 shrink-0"
                          aria-hidden
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Footer: counter + progress + arrows */}
        {snapCount > 0 && (
          <div className="mt-10 flex items-center gap-6">
            <p className="text-sm font-semibold text-foreground">
              {currentSnap + 1}/{snapCount}
            </p>
            <div
              className="relative h-0.5 flex-1 bg-muted"
              role="presentation"
            >
              <div
                className="absolute inset-y-0 left-0 bg-foreground/50 transition-[width] duration-300"
                style={{
                  width: `${((currentSnap + 1) / snapCount) * 100}%`,
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous destinations"
                className="size-10 rounded-full"
                disabled={currentSnap === 0}
                onClick={() => api?.scrollPrev()}
              >
                <ArrowLeftIcon aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next destinations"
                className="size-10 rounded-full"
                disabled={currentSnap === snapCount - 1}
                onClick={() => api?.scrollNext()}
              >
                <ArrowRightIcon aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
