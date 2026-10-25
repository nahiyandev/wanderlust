import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { db } from "@/lib/db";

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  "https://wanderlust-sigma-wine.vercel.app",
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

// Server-only auth instance (better-auth reads BETTER_AUTH_SECRET /
// BETTER_AUTH_URL / GOOGLE_* from .env.local). Collections land in the
// shared "wanderlust" database: user, session, account.
export const auth = betterAuth({
  database: mongodbAdapter(db),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6, // matches the UI validation on /login and /signup
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [admin()],
  user: {
    additionalFields: {
      // Profile-page extras (editable via authClient.updateUser)
      location: { type: "string", required: false },
      nationality: { type: "string", required: false },
      // Optional override; AuthProvider falls back to createdAt
      memberSince: { type: "string", required: false },
    },
  },
});
