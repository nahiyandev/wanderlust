"use client";

// Thin wrapper mapping a raw backend destination record to the shared
// UpdatePackageDialog (real PATCH /destinations/:id flow lives there).
// Used by the admin dashboard's "Manage Travel Packages" list.

export type RawAdminDestination = {
  id: string;
  name: string;
  country: string;
  category: string;
  price: number;
  imageUrl?: string;
  departureDate?: string;
  duration?: string;
  description?: string;
};

import { UpdatePackageDialog } from "@/components/update-package-dialog";

export default function EditDestinationDialog({
  destination,
  onUpdated,
}: {
  destination: RawAdminDestination;
  onUpdated?: () => void;
}) {
  return (
    <UpdatePackageDialog
      destination={{
        id: destination.id,
        name: destination.name,
        location: destination.country,
        category: destination.category,
        price: destination.price,
        imageUrl: destination.imageUrl,
        departureDate: destination.departureDate,
        duration: destination.duration,
        overview: destination.description,
      }}
      onSaved={onUpdated}
    />
  );
}
