import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Thin proxies in front of the sibling backend's /bookings routes.
// Browsers don't attach the better-auth cookie to cross-port (:5000)
// requests, so the client calls THIS same-origin route; the session is
// checked here, the cookie is forwarded, and the backend's requireAuth
// guard re-validates it against GET /api/auth/get-session.

const BACKEND_URL = "http://localhost:5000";

type RawBookingDoc = {
  _id?: unknown;
  bookingCode?: string;
  destinationId?: unknown;
  destinationName?: string;
  imageUrl?: string;
  departureDate?: string;
  total?: number | string;
  status?: string;
  createdAt?: Date | string;
};

// Type for AuthProvider's Booking shape (client-side view of a booking doc)
export type ClientBooking = {
  id: string;
  bookingCode: string;
  destinationId?: string;
  title: string;
  image: string;
  status: "Confirmed" | "Pending";
  departure: string;
  price: number;
  bookedAt: string;
};

const getBackendCookie = async () => (await headers()).get("cookie") ?? "";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = (await request.json()) as {
    destinationId?: unknown;
    departureDate?: unknown;
    travelers?: unknown;
  };

  const res = await fetch(`${BACKEND_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: await getBackendCookie() },
    body: JSON.stringify(body),
  });

  // Backend returns { id, bookingCode } (201) or an error payload.
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/bookings`, {
    headers: { cookie: await getBackendCookie() },
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Could not load bookings from backend" },
      { status: res.status },
    );
  }

  const raw = (await res.json()) as RawBookingDoc[];

  const bookings: ClientBooking[] = raw.map((booking) => ({
    id: String(booking._id),
    bookingCode: booking.bookingCode ?? "BK-UNKNOWN",
    destinationId:
      booking.destinationId !== undefined
        ? String(booking.destinationId)
        : undefined,
    title: booking.destinationName ?? "Unknown destination",
    image: booking.imageUrl || "/destinations/image1.png",
    status: booking.status === "pending" ? "Pending" : "Confirmed",
    departure: booking.departureDate ?? "",
    price: Number(booking.total ?? 0),
    bookedAt: booking.createdAt
      ? new Date(booking.createdAt).toISOString()
      : new Date().toISOString(),
  }));

  return NextResponse.json({ bookings });
}
