"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const TESTIMONIALS = [
  {
    quote:
      '"The Bali Trip Was Absolutely Magical! Every Detail Was Perfectly Planned. The Resorts Were Luxurious And The Cultural Experiences Were Unforgettable."',
    name: "Michael Chen",
    location: "Singapore",
    image: "/images/person1.png",
  },
  {
    quote:
      '"Swiss Alps Adventure Exceeded All Expectations. The Mountain Views Were Breathtaking And Our Guide Was Incredibly Knowledgeable. Highly Recommend!"',
    name: "Sarah Johnson",
    location: "New York, USA",
    image: "/images/person2.png",
  },
];

export function TestimonialsSection() {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <section className="border-y bg-background px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl sm:text-5xl">
              What Travelers Say
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Real experiences from our happy travelers
            </p>
          </div>
          <div className="hidden gap-3 md:flex">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous testimonials"
              className="size-11 rounded-full"
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next testimonials"
              className="size-11 rounded-full"
              onClick={() => api?.scrollNext()}
            >
              <ArrowRightIcon />
            </Button>
          </div>
        </div>

        <Carousel setApi={setApi} className="mt-10" opts={{ loop: false }}>
          <CarouselContent className="-ml-6">
            {TESTIMONIALS.map((testimonial) => (
              <CarouselItem
                key={testimonial.name}
                className="pl-6 md:basis-1/2"
              >
                <article className="flex bg-card">
                  <div className="flex flex-1 flex-col p-6">
                    <blockquote className="font-heading text-lg leading-snug antialiased">
                      {testimonial.quote}
                    </blockquote>
                    <footer className="mt-auto pt-6">
                      <p className="flex items-center gap-2 text-brand">
                        <span aria-hidden>â€”</span> {testimonial.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </footer>
                  </div>
                  <div className="relative aspect-3/4 w-40 shrink-0 self-stretch sm:w-44">
                    <Image
                      src={testimonial.image}
                      alt={`Portrait of ${testimonial.name}`}
                      fill
                      sizes="176px"
                      className="object-cover"
                    />
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
