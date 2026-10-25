"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  CompassIcon,
  EyeIcon,
  LockIcon,
  MapPinIcon,
  Trash2Icon,
} from "lucide-react";

import { useAuth, Booking } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyBookingsPage() {
  const { user, bookings, cancelBooking, isLoaded } = useAuth();
  const [cancelTarget, setCancelTarget] = React.useState<Booking | null>(null);
  const [viewTarget, setViewTarget] = React.useState<Booking | null>(null);

  function confirmCancel() {
    if (!cancelTarget) return;
    cancelBooking(cancelTarget.id);
    setCancelTarget(null);
  }

  if (!isLoaded) {
    return (
      <main className="min-h-[calc(100svh-3.5rem)] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading your bookings...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100svh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="size-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4">
          <LockIcon className="size-8" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-neutral-900">
          Sign In to View Bookings
        </h1>
        <p className="mt-2 text-neutral-500 max-w-md">
          Your travel itineraries and reservations are linked to your Wanderlust account.
          Please log in to manage your bookings.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            className="bg-brand text-white hover:bg-brand/90 font-semibold px-6"
          >
            Sign In
          </Button>
          <Button
            render={<Link href="/destinations" />}
            nativeButton={false}
            variant="outline"
          >
            Explore Destinations
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl font-medium tracking-tight text-neutral-900">
              My Bookings
            </h1>
            <p className="mt-2.5 text-base text-neutral-500">
              Manage and view your upcoming travel plans
            </p>
          </div>

          <Button
            render={<Link href="/destinations" />}
            nativeButton={false}
            className="self-start sm:self-auto bg-brand hover:bg-brand/90 text-white font-semibold flex items-center gap-2"
          >
            <CompassIcon className="size-4" />
            Book Another Trip
          </Button>
        </div>

        {/* Bookings List */}
        <div className="mt-10 flex flex-col gap-6">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
              <div className="size-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="size-6" />
              </div>
              <p className="text-lg font-bold text-neutral-800">
                You have no upcoming bookings yet.
              </p>
              <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
                Explore our curated destinations and click &quot;Book Now&quot; to reserve your next adventure!
              </p>
              <Button
                render={<Link href="/destinations" />}
                nativeButton={false}
                className="mt-6 bg-brand text-white hover:bg-brand/90 font-semibold"
              >
                Browse Destinations
              </Button>
            </div>
          ) : (
            bookings.map((booking) => {
              const isConfirmed = booking.status === "Confirmed";

              return (
                <div
                  key={booking.id}
                  className="group flex flex-col md:flex-row items-stretch overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-sm gap-6 hover:shadow-md transition-shadow"
                >
                  {/* Left: Thumbnail Image */}
                  <div className="relative w-full md:w-95 lg:w-105 aspect-video md:aspect-16/10 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={booking.image || "/destinations/image1.png"}
                      alt={booking.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Middle: Content */}
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      {/* Status badge */}
                      <div>
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f9ee] px-3.5 py-1 text-xs sm:text-sm font-semibold text-[#1e9e35]">
                            <CheckCircle2Icon className="size-4" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff5e5] px-3.5 py-1 text-xs sm:text-sm font-semibold text-[#fe9a00]">
                            <ClockIcon className="size-4" />
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-bold text-neutral-900">
                        {booking.title}
                      </h2>

                      {/* Meta info */}
                      <div className="mt-3 flex flex-col gap-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="size-4 text-neutral-400" />
                          <span>Departure: {booking.departure}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="size-4 text-neutral-400" />
                          <span>Booking ID: {booking.bookingCode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-4">
                      <p className="font-heading text-3xl sm:text-4xl font-bold text-brand">
                        ${booking.price}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-end md:justify-center gap-3 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCancelTarget(booking)}
                      className="h-11 px-5 rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <Trash2Icon className="size-4 text-red-500" />
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setViewTarget(booking)}
                      className="h-11 px-6 rounded-lg bg-brand hover:bg-brand/90 text-white font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <EyeIcon className="size-4" />
                      View
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancel Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your trip to{" "}
              <strong className="text-neutral-900">
                {cancelTarget?.title}
              </strong>
              ? This reservation will be removed from your bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelTarget(null)}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Booking Details Dialog */}
      <Dialog
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
      >
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle>{viewTarget?.title}</DialogTitle>
            <DialogDescription>
              Booking Reference: {viewTarget?.bookingCode.toUpperCase()} • Status:{" "}
              {viewTarget?.status}
            </DialogDescription>
          </DialogHeader>

          {viewTarget && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <Image
                  src={viewTarget.image}
                  alt={viewTarget.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="rounded-xl bg-neutral-50 p-4 text-sm flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Departure Date</span>
                  <span className="font-semibold text-neutral-900">
                    {viewTarget.departure}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Booking ID</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {viewTarget.bookingCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Paid</span>
                  <span className="font-bold text-brand">
                    ${viewTarget.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span
                    className={`font-semibold ${
                      viewTarget.status === "Confirmed"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {viewTarget.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 text-center">
                A copy of your travel itinerary and tickets have been sent to your
                registered email ({user.email}).
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
