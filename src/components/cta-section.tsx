import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative isolate flex flex-col items-center justify-center px-4 py-24 text-center text-white sm:py-28">
      <Image
        src="/images/CTA.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden />

      <h2 className="font-heading text-3xl text-balance sm:text-5xl lg:text-6xl">
        Ready To Start Your Journey?
      </h2>
      <p className="mt-4 text-sm text-white/90 sm:text-base">
        Join thousands of travelers who have discovered the world with us
      </p>

      <Button
        size="lg"
        className="mt-8 h-12 gap-3 rounded-none bg-white px-8 text-sm font-semibold tracking-widest uppercase hover:bg-white/90"
      >
        Book Your Trip Today
        <ArrowRightIcon />
      </Button>
    </section>
  );
}
