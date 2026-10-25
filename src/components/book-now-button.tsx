"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CalendarIcon, CheckCircle2Icon, Loader2, SparklesIcon } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookNowProps {
  destination: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    location?: string;
    departureDate?: string;
  };
}

export function BookNowButton({ destination }: BookNowProps) {
  const { user, addBooking } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [departureDate, setDepartureDate] = React.useState(
    destination.departureDate || "2026-05-15",
  );
  const [guests, setGuests] = React.useState(1);
  const [isBooking, setIsBooking] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdBookingCode, setCreatedBookingCode] = React.useState<string | null>(null);

  function handleOpen() {
    setIsSuccess(false);
    setIsOpen(true);
  }

  async function handleConfirmBooking(event: React.FormEvent) {
    event.preventDefault();
    setIsBooking(true);

    try {
      // Real booking — POST /api/bookings (MongoDB, server-validated price).
      const booked = await addBooking({
        destinationId: destination.id,
        title: destination.name,
        image: destination.imageUrl || "/destinations/image1.png",
        departure: departureDate,
        price: destination.price * guests,
        status: "Confirmed",
      });

      setCreatedBookingCode(booked.bookingCode);
      setIsSuccess(true);
    } catch {
      // Booking failed (server error). A 401 already shows the login notice
      // because `user` would be null in that state.
      setIsSuccess(false);
      window.alert(
        "Booking failed — is the server running? Please try again.",
      );
    } finally {
      setIsBooking(false);
    }
  }

  const totalPrice = destination.price * guests;

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        className="mt-3 h-11 w-full gap-2 bg-brand text-white hover:bg-brand/90 font-semibold cursor-pointer shadow-xs active:scale-[0.99] transition-all"
      >
        Book Now
        <ArrowRightIcon className="size-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-6">
          {!user ? (
            /* User Not Logged In Notice */
            <div className="flex flex-col items-center text-center py-4">
              <div className="size-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3">
                <SparklesIcon className="size-6" />
              </div>
              <DialogTitle className="text-xl">Login Required to Book</DialogTitle>
              <DialogDescription className="mt-2 text-sm text-neutral-500">
                Please log in or create an account to book your trip to{" "}
                <strong className="text-neutral-800">{destination.name}</strong>.
              </DialogDescription>
              <div className="mt-6 flex w-full flex-col gap-2.5">
                <Button
                  render={<Link href="/login" />}
                  nativeButton={false}
                  className="w-full bg-brand text-white hover:bg-brand/90 font-semibold"
                >
                  Log In Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : isSuccess ? (
            /* Booking Success Feedback */
            <div className="flex flex-col items-center text-center py-4">
              <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2Icon className="size-8" />
              </div>
              <DialogTitle className="text-2xl font-heading text-neutral-900">
                Booking Confirmed!
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-neutral-500">
                Your trip to <strong className="text-neutral-900">{destination.name}</strong> has
                been booked successfully.
              </DialogDescription>

              <div className="mt-4 w-full rounded-xl bg-neutral-50 p-4 text-sm flex flex-col gap-1.5 border border-neutral-200/80">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Booking Reference</span>
                  <span className="font-mono font-bold text-neutral-900 uppercase">
                    {createdBookingCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Departure</span>
                  <span className="font-semibold text-neutral-900">{departureDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Travelers</span>
                  <span className="font-semibold text-neutral-900">{guests} Person(s)</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200/80 pt-1.5 mt-1">
                  <span className="text-neutral-500">Total Price</span>
                  <span className="font-bold text-brand text-base">${totalPrice}</span>
                </div>
              </div>

              <div className="mt-6 flex w-full flex-col gap-2.5">
                <Button
                  render={<Link href="/my-bookings" />}
                  nativeButton={false}
                  className="w-full bg-brand text-white hover:bg-brand/90 font-semibold"
                >
                  View My Bookings
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleConfirmBooking}>
              <DialogHeader>
                <DialogTitle>Book {destination.name}</DialogTitle>
                <DialogDescription>
                  Review trip details and confirm your reservation.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex flex-col gap-4">
                {destination.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
                    <Image
                      src={destination.imageUrl}
                      alt={destination.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-departure" className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                    <CalendarIcon className="size-4 text-brand" />
                    Departure Date
                  </label>
                  <input
                    id="modal-departure"
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="h-11 rounded-lg border border-neutral-200 bg-[#f8fafc] px-3.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-guests" className="text-sm font-semibold text-neutral-800">
                    Number of Travelers
                  </label>
                  <select
                    id="modal-guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="h-11 rounded-lg border border-neutral-200 bg-[#f8fafc] px-3.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Traveler" : "Travelers"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Total Amount</p>
                    <p className="font-heading text-2xl font-bold text-brand mt-0.5">
                      ${totalPrice}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    ${destination.price} x {guests} traveler{guests > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <DialogFooter className="mt-6 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isBooking}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isBooking}
                  className="bg-brand text-white hover:bg-brand/90 font-semibold cursor-pointer"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

