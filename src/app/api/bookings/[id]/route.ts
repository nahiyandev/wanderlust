import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/backend-url";

// Booking cancel proxy — forwards to the sibling backend's
// DELETE /bookings/:id (ownership enforced there, cookie forwarded here).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const res = await fetch(`${BACKEND_URL}/bookings/${id}`, {
    method: "DELETE",
    headers: { cookie: (await headers()).get("cookie") ?? "" },
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(await res.json(), { status: res.status });
}
