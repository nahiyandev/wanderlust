import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type RawBooking = Record<string, unknown> & { _id?: unknown };

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // All bookings across every user (newest first)
  const allBookings = (await db
    .collection("bookings")
    .find()
    .sort({ createdAt: -1 })
    .toArray()) as RawBooking[];

  const bookings = allBookings.map((booking) => ({
    id: String(booking._id),
    bookingCode: (booking.bookingCode as string) ?? "BK-UNKNOWN",
    userEmail: (booking.userEmail as string) ?? "unknown",
    destinationId:
      booking.destinationId !== undefined
        ? String(booking.destinationId)
        : undefined,
    title: (booking.destinationName as string) ?? "Unknown destination",
    departure: (booking.departureDate as string) ?? "",
    price: Number(booking.total ?? 0),
    status: booking.status === "pending" ? "Pending" : "Confirmed",
  }));

  const travelers = new Set(
    allBookings.map((booking) => booking.userId as string).filter(Boolean),
  ).size;

  // Destination packages live in the same database the sibling backend uses
  const destinations = (await db
    .collection("destinations")
    .find()
    .toArray()) as Array<Record<string, unknown>>;

  const destinationList = destinations
    .filter((destination) =>
      /[a-zA-Z]/.test(
        String(destination.destinationName ?? destination.name ?? ""),
      ),
    )
    .map((destination) => ({
      id: String(destination._id),
      name: String(
        destination.destinationName ?? destination.name ?? "",
      ).trim(),
      country: String(destination.country ?? ""),
      category: String(destination.category ?? ""),
      price: Number(destination.price ?? 0),
      imageUrl: String(destination.image ?? destination.imageUrl ?? ""),
      departureDate: String(destination.departureDate ?? ""),
      duration: String(destination.duration ?? ""),
      description: String(destination.description ?? ""),
    }));

  return NextResponse.json({
    bookings,
    travelers,
    destinations: destinationList,
  });
}
