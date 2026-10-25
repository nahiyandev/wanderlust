"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";

import type { auth } from "@/lib/auth";

// Client-side auth hooks: signUp.email, signIn.email, signOut, useSession,
// updateUser. inferAdditionalFields brings the server-configured extra user
// fields (location, nationality, memberSince) into the client types.
// Type-only import below — the server module is never bundled here.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});
