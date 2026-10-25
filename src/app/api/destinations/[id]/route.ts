import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Admin-only proxy for destination UPDATE + DELETE on the sibling backend.
// Forwards the session cookie so the backend's requireAdmin guard passes.
type RouteContext = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  if (session.user.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin only" }, { status: 403 }) };
  }
  const cookie = (await headers()).get("cookie") ?? "";
  return { cookie, error: null };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { cookie, error } = await requireAdmin();
  if (error || !cookie) return error!;

  const { id } = await context.params;
  const body = await request.json();
  const res = await fetch(`http://localhost:5000/destinations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { cookie, error } = await requireAdmin();
  if (error || !cookie) return error!;

  const { id } = await context.params;
  const res = await fetch(`http://localhost:5000/destinations/${id}`, {
    method: "DELETE",
    headers: { cookie },
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(await res.json(), { status: res.status });
}
