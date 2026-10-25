import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Admin-only proxy for destination CREATE.
// The browser can't call the backend directly with the auth cookie
// (cross-port + SameSite=Lax), so mutations go through Next, which
// forwards the session cookie — the backend's requireAdmin guard
// re-validates it against GET /api/auth/get-session.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await fetch("http://localhost:5000/add-destination", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json(), { status: res.status });
}
