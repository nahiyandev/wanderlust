import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// better-auth catch-all handler: /api/auth/*
export const { GET, POST } = toNextJsHandler(auth.handler);
