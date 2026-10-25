import React, { Suspense } from "react";

import {
  DestinationsGrid,
  type DestinationItem,
} from "@/components/destinations-grid";

// Covers both backend record shapes (older: name/imageUrl, newer:
// destinationName/image).
type BackendListItem = {
  _id?: string;
  id?: string;
  destinationName?: string;
  name?: string;
  country?: string;
  category?: string;
  price?: number | string;
  duration?: string;
  image?: string;
  imageUrl?: string;
};

function mapDestinationItem(raw: BackendListItem): DestinationItem {
  return {
    id: String(raw._id ?? raw.id ?? ""),
    name: raw.destinationName ?? raw.name ?? "",
    location: raw.country ?? "",
    category: raw.category ?? "",
    price: Number(raw.price ?? 0),
    duration: raw.duration ?? "",
    imageUrl: raw.image ?? (raw.imageUrl || undefined),
  };
}

async function DestinationsList() {
  let destinations: DestinationItem[] = [];
  let fetchFailed = false;

  try {
    // Backend API: wanderlust backend running on :5000
    const res = await fetch("http://localhost:5000/destinations");
    if (res.ok) {
      const raw = (await res.json()) as BackendListItem[];
      destinations = raw.map(mapDestinationItem);
    } else {
      fetchFailed = true;
    }
  } catch {
    fetchFailed = true;
  }

  if (fetchFailed) {
    return (
      <div className="mt-8 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
        Could not load destinations — is the backend running on
        localhost:5000?
      </div>
    );
  }

  return <DestinationsGrid destinations={destinations} />;
}

function GridFallback() {
  return (
    <div>
      <div className="mt-8 h-10 animate-pulse rounded-md border" />
      <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-2/1 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-heading text-3xl sm:text-5xl">
        Explore All Destinations
      </h1>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">
        Find your perfect travel experience from our curated collection
      </p>

      {/* cacheComponents: uncached list fetch streams inside <Suspense> */}
      <Suspense fallback={<GridFallback />}>
        <DestinationsList />
      </Suspense>
    </div>
  );
}
