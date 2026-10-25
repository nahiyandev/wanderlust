import { MongoClient } from "mongodb";

// Shared MongoDB connection — same database the sibling backend
// (../wanderlust-server) uses. The driver connects lazily on first query.
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI missing — create .env.local (see AGENTS.md).");
}

export const db = new MongoClient(uri).db("wanderlust");
