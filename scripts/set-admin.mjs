// Usage:  node scripts/set-admin.mjs user@example.com
// Sets the better-auth "role" field of the given user to "admin"
// (the admin plugin puts the role on the user document).
import { MongoClient } from "mongodb";
import process from "node:process";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/set-admin.mjs <email>");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const result = await client
  .db()
  .collection("user")
  .updateOne({ email: email.trim() }, { $set: { role: "admin" } });

if (result.matchedCount === 0) {
  console.error(`No user found with email: ${email}`);
} else {
  console.log(`OK — ${email} is now an admin. They must sign in again.`);
}
await client.close();
