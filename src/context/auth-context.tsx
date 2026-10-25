"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export interface User {
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  location?: string;
  memberSince?: string;
  nationality?: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  destinationId?: string;
  title: string;
  image: string;
  status: "Confirmed" | "Pending";
  departure: string;
  price: number;
  bookedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  bookings: Booking[];
  login: (
    email: string,
    password?: string,
    role?: "admin" | "user",
    name?: string,
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
  addBooking: (booking: {
    destinationId?: string;
    title: string;
    image: string;
    departure: string;
    price: number;
    status?: "Confirmed" | "Pending";
  }) => Promise<Booking>;
  cancelBooking: (id: string) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

function mapSessionToUser(
  sessionUser: {
    name: string;
    email: string;
    role?: string;
    image?: string | null;
    createdAt?: Date | string;
  } & Record<string, unknown>,
): User {
  const createdAt = new Date(sessionUser.createdAt ?? Date.now());
  return {
    name: sessionUser.name,
    email: sessionUser.email,
    role: sessionUser.role === "admin" ? "admin" : "user",
    avatar: sessionUser.image || undefined,
    location:
      (sessionUser.location as string | undefined) ?? undefined,
    memberSince:
      (sessionUser.memberSince as string | undefined) ??
      createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    nationality:
      (sessionUser.nationality as string | undefined) ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const user = React.useMemo(
    () =>
      session?.user ? mapSessionToUser(session.user as never) : null,
    [session],
  );
  const isLoaded = !isPending;

  const [bookings, setBookings] = React.useState<Booking[]>([]);

  // Load the signed-in user's bookings from the bookings API.
  React.useEffect(() => {
    if (!isLoaded || !user) return;

    let active = true;
    fetch("/api/bookings")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(
        (data: { bookings: Booking[] }) => {
          if (active) setBookings(data.bookings);
        },
      )
      .catch(() => {
        // Backend down or not signed in — keep the list empty.
      });
    return () => {
      active = false;
    };
  }, [isLoaded, user]);

  // Real sign-in via better-auth (role/name args kept for interface
  // compatibility; the real role now lives on the authenticated user).
  async function login(
    email: string,
    password?: string,
  ): Promise<boolean> {
    if (!password) return false;
    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    return !error;
  }

  async function logout() {
    await authClient.signOut();
    setBookings([]);
    router.push("/");
  }

  async function updateProfile(updated: Partial<User>) {
    if (!user) return;
    const payload: Record<string, unknown> = {};
    if (updated.name !== undefined) payload.name = updated.name;
    if (updated.avatar !== undefined) payload.image = updated.avatar || null;
    if (updated.location !== undefined) payload.location = updated.location;
    if (updated.nationality !== undefined)
      payload.nationality = updated.nationality;
    if (updated.memberSince !== undefined)
      payload.memberSince = updated.memberSince;
    if (Object.keys(payload).length === 0) return;
    await authClient.updateUser(payload);
  }

  // Real booking creation through /api/bookings (MongoDB, server-validated).
  async function addBooking(data: {
    destinationId?: string;
    title: string;
    image: string;
    departure: string;
    price: number;
    status?: "Confirmed" | "Pending";
  }): Promise<Booking> {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationId: data.destinationId,
        departureDate: data.departure,
        travelers: 1,
      }),
    });
    const payload = (await res.json()) as { id?: string; bookingCode?: string };
    if (!res.ok || !payload.id || !payload.bookingCode) {
      throw new Error("Booking failed");
    }

    const newBooking: Booking = {
      id: payload.id,
      bookingCode: payload.bookingCode,
      destinationId: data.destinationId,
      title: data.title,
      image: data.image || "/destinations/image1.png",
      status: data.status || "Confirmed",
      departure: data.departure || "",
      price: data.price,
      bookedAt: new Date().toISOString(),
    };
    setBookings((previous) => [newBooking, ...previous]);
    return newBooking;
  }

  // Real booking cancellation through /api/bookings/:id (ownership-checked).
  async function cancelBooking(id: string) {
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((previous) => previous.filter((b) => b.id !== id));
    } else {
      window.alert(
        "Cancel failed — please check that the server is running and try again.",
      );
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        bookings,
        login,
        logout,
        updateProfile,
        addBooking,
        cancelBooking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
