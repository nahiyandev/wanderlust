"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CompassIcon,
  FolderPlusIcon,
  PackageCheckIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import EditDestinationDialog from "@/components/EditDestinationDialog";
import { DeleteDestinationButton } from "@/components/delete-destination-button";

type AdminBooking = {
  id: string;
  bookingCode: string;
  userEmail: string;
  destinationId?: string;
  title: string;
  departure: string;
  price: number;
  status: "Confirmed" | "Pending";
};

type AdminDestination = {
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

type Overview = {
  bookings: AdminBooking[];
  travelers: number;
  destinations: AdminDestination[];
};

export default function AdminPage() {
  const { user, isLoaded } = useAuth();
  const isAdmin = user?.role === "admin";

  const [overview, setOverview] = React.useState<Overview | null>(null);
  const [loadError, setLoadError] = React.useState(false);

  const loadOverview = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = (await res.json()) as Overview;
      setOverview(data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  // Real overview data — only while an admin is signed in.
  React.useEffect(() => {
    if (isLoaded && isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- manual fetch/retry flow, setState happens after await
      void loadOverview();
    }
  }, [isLoaded, isAdmin, loadOverview]);

  if (!isLoaded) {
    return (
      <main className="min-h-[calc(100svh-3.5rem)] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading admin access...</p>
      </main>
    );
  }

  // Restrict access to admin role
  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-[calc(100svh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="size-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlertIcon className="size-8" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-neutral-900">
          Access Denied
        </h1>
        <p className="mt-2 text-neutral-500 max-w-md">
          This portal is restricted to authorized administrators only. Please log in
          with an admin account to view this page.
        </p>
        <div className="mt-6 flex gap-3">
          <Button render={<Link href="/" />} className="bg-brand text-white hover:bg-brand/90">
            Go to Home
          </Button>
          <Button render={<Link href="/login" />} variant="outline">
            Login as Admin
          </Button>
        </div>
      </main>
    );
  }

  const bookings = overview?.bookings ?? [];
  const destinations = overview?.destinations ?? [];
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (Number(b.price) || 0),
    0,
  );

  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header: left title, right admin profile card */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand px-3 py-0.5 text-xs font-semibold">
                <ShieldCheckIcon className="size-3.5" />
                Admin Panel
              </span>
            </div>
            <h1 className="mt-2 font-heading text-4xl sm:text-5xl font-medium tracking-tight text-neutral-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-base text-neutral-500">
              Welcome back, {user.name}. Manage travel packages, customer bookings, and settings.
            </p>
          </div>

          {/* Admin profile card */}
          <div className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 pr-6 shadow-sm sm:w-fit">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full border-2 border-neutral-100">
              <Image
                src={user.avatar || "/images/person1.png"}
                alt={user.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-neutral-900">
                  {user.name}
                </p>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  <ShieldCheckIcon className="size-3" />
                  Admin
                </span>
              </div>
              <p className="truncate text-sm text-neutral-500">{user.email}</p>
              <Button
                render={<Link href="/profile" />}
                nativeButton={false}
                variant="outline"
                className="mt-1.5 h-7 rounded-md px-2.5 text-xs"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {loadError && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Could not load dashboard data. Is the dev server / database running?{" "}
            <button
              type="button"
              onClick={() => void loadOverview()}
              className="underline font-semibold cursor-pointer"
            >
              Retry
            </button>
          </p>
        )}

        {/* Overview Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">Total Bookings</p>
              <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <PackageCheckIcon className="size-5" />
              </div>
            </div>
            <p className="mt-4 font-heading text-3xl font-bold text-neutral-900">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">Total Revenue</p>
              <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="font-bold text-base">$</span>
              </div>
            </div>
            <p className="mt-4 font-heading text-3xl font-bold text-neutral-900">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">Active Travelers</p>
              <div className="size-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <UsersIcon className="size-5" />
              </div>
            </div>
            <p className="mt-4 font-heading text-3xl font-bold text-neutral-900">
              {overview?.travelers ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">Destinations</p>
              <div className="size-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <CompassIcon className="size-5" />
              </div>
            </div>
            <p className="mt-4 font-heading text-3xl font-bold text-neutral-900">
              {destinations.length}
            </p>
          </div>
        </div>

        {/* Manage Travel Packages */}
        <div className="mt-10 rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-neutral-200/80">
            <div>
              <h2 className="font-heading text-xl font-bold text-neutral-900">
                Manage Travel Packages
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Edit details, remove expired packages, or add new ones.
              </p>
            </div>
            <Button
              render={<Link href="/add-destination" />}
              nativeButton={false}
              className="bg-brand hover:bg-brand/90 text-white font-semibold flex items-center gap-2 shadow-xs"
            >
              <FolderPlusIcon className="size-4" />
              Add New Package
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Destination</th>
                  <th className="py-3.5 px-6 font-semibold">Country</th>
                  <th className="py-3.5 px-6 font-semibold">Category</th>
                  <th className="py-3.5 px-6 font-semibold">Price</th>
                  <th className="py-3.5 px-6 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {destinations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      {loadError
                        ? "Could not load packages."
                        : "No travel packages yet — add the first one!"}
                    </td>
                  </tr>
                ) : (
                  destinations.map((destination) => (
                    <tr
                      key={destination.id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-neutral-900">
                        {destination.name}
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        {destination.country || "—"}
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        {destination.category || "—"}
                      </td>
                      <td className="py-4 px-6 font-semibold text-brand">
                        ${destination.price}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <EditDestinationDialog
                            destination={destination}
                            onUpdated={() => void loadOverview()}
                          />
                          <DeleteDestinationButton
                            id={destination.id}
                            onDeleted={() => void loadOverview()}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Bookings Table */}
        <div className="mt-10 rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-200/80 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-neutral-900">
                Customer Bookings
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Live list of bookings placed by all customers.
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {bookings.length} Bookings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Booking ID</th>
                  <th className="py-3.5 px-6 font-semibold">Customer</th>
                  <th className="py-3.5 px-6 font-semibold">Destination</th>
                  <th className="py-3.5 px-6 font-semibold">Departure Date</th>
                  <th className="py-3.5 px-6 font-semibold">Price</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      {loadError
                        ? "Could not load bookings."
                        : "No customer bookings yet."}
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-neutral-800">
                        {booking.bookingCode.toUpperCase()}
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        {booking.userEmail}
                      </td>
                      <td className="py-4 px-6 font-medium text-neutral-900">
                        {booking.title}
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        {booking.departure || "—"}
                      </td>
                      <td className="py-4 px-6 font-semibold text-brand">
                        ${booking.price}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            booking.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
