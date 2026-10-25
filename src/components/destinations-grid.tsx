"use client";

import * as React from "react";
import Image from "next/image";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Unified shape — mapped from the backend's two record formats in page.tsx.
export type DestinationItem = {
  id: string;
  name: string;
  location: string;
  category: string;
  price: number;
  duration: string;
  imageUrl?: string;
  rating?: number;
};

const PRICE_RANGES = [
  { label: "Under $1000", test: (price: number) => price < 1000 },
  { label: "$1000 - $2000", test: (price: number) => price >= 1000 && price < 2000 },
  { label: "$2000 - $3000", test: (price: number) => price >= 2000 && price < 3000 },
  { label: "$3000+", test: (price: number) => price >= 3000 },
] as const;

const SORT_OPTIONS = [
  "Price: Low to High",
  "Price: High to Low",
  "Rating: High to Low",
  "Name: A to Z",
] as const;

const triggerClass =
  "w-full h-10 justify-between rounded-none border-0 bg-transparent px-4 text-xs tracking-widest uppercase data-placeholder:text-muted-foreground";

export function DestinationsGrid({
  destinations,
}: {
  destinations: DestinationItem[];
}) {
  const [category, setCategory] = React.useState<string | null>(null);
  const [priceRange, setPriceRange] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<string | null>(null);

  // Categories come from the real data (includes e.g. "Relaxation").
  const categories = React.useMemo(
    () => [...new Set(destinations.map((d) => d.category).filter(Boolean))].sort(),
    [destinations],
  );

  const filtered = React.useMemo(() => {
    let result = [...destinations];

    if (category) {
      result = result.filter((destination) => destination.category === category);
    }

    if (priceRange) {
      const range = PRICE_RANGES.find((r) => r.label === priceRange);
      if (range) result = result.filter((d) => range.test(d.price));
    }

    if (sortBy) {
      switch (sortBy) {
        case "Price: Low to High":
          result.sort((a, b) => a.price - b.price);
          break;
        case "Price: High to Low":
          result.sort((a, b) => b.price - a.price);
          break;
        case "Rating: High to Low":
          result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
          break;
        case "Name: A to Z":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return result;
  }, [destinations, category, priceRange, sortBy]);

  return (
    <>
      {/* Filters */}
      <div className="mt-8 flex flex-col overflow-hidden rounded-md border border-border sm:grid sm:grid-cols-3 sm:divide-x sm:divide-border">
        <Select value={category} onValueChange={(value) => setCategory(value as string | null)}>
          <SelectTrigger className={triggerClass} aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={(value) => setPriceRange(value as string | null)}>
          <SelectTrigger className={triggerClass} aria-label="Filter by price range">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((range) => (
              <SelectItem key={range.label} value={range.label}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as string | null)}>
          <SelectTrigger className={triggerClass} aria-label="Sort by">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Showing {filtered.length} destinations
      </p>

      {/* Cards */}
      <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((destination) => (
          <article key={destination.id}>
            <div className="relative overflow-hidden rounded-md">
              <Image
                src={
                  destination.imageUrl?.replace(/w=\d+/, "w=800") ??
                  "/images/Banner.png"
                }
                alt={destination.name || "Destination"}
                width={560}
                height={280}
                className="aspect-2/1 w-full object-cover"
              />
              {destination.rating !== undefined && (
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-sm bg-white/80 px-2 py-0.5 text-sm font-medium text-foreground">
                  {destination.rating}
                  <StarIcon className="size-3.5 fill-current" aria-hidden />
                </span>
              )}
            </div>

            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
                {destination.location}
              </p>
              <div className="mt-1.5 flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-lg">{destination.name}</h2>
                <p className="whitespace-nowrap">
                  <span className="font-semibold">${destination.price}</span>
                  <span className="text-xs text-muted-foreground">
                    /Person
                  </span>
                </p>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarIcon className="size-3.5 shrink-0" aria-hidden />
                {destination.duration}
              </p>
              <a
                href={`/destinations/${destination.id}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium tracking-wide text-brand uppercase hover:underline"
              >
                Book Now
                <ArrowUpRightIcon className="size-4" aria-hidden />
              </a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
