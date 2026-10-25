import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";

import { UpdatePackageDialog } from "@/components/update-package-dialog";
import { DeleteDestinationButton } from "@/components/delete-destination-button";
import { BookNowButton } from "@/components/book-now-button";
import { BACKEND_URL } from "@/lib/backend-url";

// Internal shape used by the UI — mapped from the backend response below
// (backend keys: destinationName, country, image, description, ...).
type Destination = {
  id: string;
  name: string;
  location: string;
  price: number;
  category?: string;
  imageUrl?: string;
  departureDate?: string;
  duration?: string;
  rating?: number;
  reviews?: number;
  overview?: string;
  highlights?: string[];
};

type BackendDestination = {
  _id?: string;
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
  departureDate?: string;
  description?: string;
};

function mapDestination(raw: BackendDestination): Destination {
  return {
    id: String(raw._id ?? ""),
    name: raw.destinationName ?? raw.name ?? "",
    location: raw.country ?? "",
    price: Number(raw.price ?? 0),
    category: raw.category,
    imageUrl: raw.image ?? (raw.imageUrl || undefined),
    departureDate: raw.departureDate,
    duration: raw.duration,
    overview: raw.description,
  };
}

const PERKS = [
  "Free cancellation up to 7 days",
  "Travel insurance included",
  "24/7 customer support",
];

function DetailFallback() {
  return (
    <>
      {/* Top row skeleton */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* Hero + content skeleton */}
      <div className="aspect-video w-full animate-pulse rounded-lg bg-muted sm:aspect-2/1" />
      <div className="mt-8 h-10 w-2/3 animate-pulse rounded-md bg-muted" />
    </>
  );
}

async function DestinationContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(`${BACKEND_URL}/destinations/${id}`);
  if (!res.ok) notFound();
  const raw = (await res.json()) as BackendDestination;
  const data = mapDestination(raw);

  // Upgrade small thumbnail URLs (e.g. Unsplash w=500) for the full-width hero.
  const heroImage = data.imageUrl?.replace(/w=\d+/, "w=1600");

  return (
    <>
      {/* Top row — data-dependent (Edit dialog is prefilled from `data`) */}
      <div className="flex items-center justify-between gap-4 py-4">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
          Back to Destinations
        </Link>

        <div className="flex items-center gap-3">
          <UpdatePackageDialog destination={data} />
          <DeleteDestinationButton id={data.id ?? ""} />
        </div>
      </div>

      {/* Hero image */}
      <div className="relative aspect-video overflow-hidden rounded-lg sm:aspect-2/1">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={data.name}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
            Image not available
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* Content column */}
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" aria-hidden />
            {data.location}
          </p>
          <h1 className="mt-2 font-heading text-4xl sm:text-5xl">
            {data.name}
          </h1>

          {(data.rating !== undefined || data.duration) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              {data.rating !== undefined && (
                <span className="flex items-center gap-1.5">
                  <StarIcon className="size-4 fill-current" aria-hidden />
                  <span className="font-semibold">{data.rating}</span>
                  {data.reviews !== undefined && (
                    <span className="text-muted-foreground">
                      ({data.reviews} reviews)
                    </span>
                  )}
                </span>
              )}
              {data.duration && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarIcon className="size-4 shrink-0" aria-hidden />
                  {data.duration}
                </span>
              )}
            </div>
          )}

          {data.overview && (
            <section className="mt-8">
              <h2 className="font-heading text-2xl">Overview</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {data.overview}
              </p>
            </section>
          )}

          {data.highlights && data.highlights.length > 0 && (
            <section className="mt-8">
              <h2 className="font-heading text-2xl">Highlights</h2>
              <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {data.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm">
                    <CheckIcon
                      className="mt-0.5 size-4 shrink-0 text-green-600"
                      aria-hidden
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Booking card */}
        <aside className="h-fit self-start rounded-md border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <p className="mt-1 text-3xl font-semibold text-brand">
            ${data.price}
          </p>
          <p className="text-xs text-muted-foreground">per person</p>

          <BookNowButton destination={data} />

          <ul className="mt-4 space-y-2 border-t pt-4">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm">
                <CheckIcon
                  className="mt-0.5 size-4 shrink-0 text-green-600"
                  aria-hidden
                />
                {perk}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}

export default function DestinationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      {/* cacheComponents: data-dependent content streams inside <Suspense> */}
      <Suspense fallback={<DetailFallback />}>
        <DestinationContent params={params} />
      </Suspense>
    </main>
  );
}
