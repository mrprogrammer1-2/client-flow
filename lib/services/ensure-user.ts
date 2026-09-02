import { db } from "@/db/index";
import { agencies, users } from "@/db/schema";
import { eq } from "drizzle-orm";

type KindeUser = {
  id?: string | null;
  email?: string | null;
  given_name?: string | null;
};

export async function ensureUserAndAgency(kindeUser: KindeUser) {
  if (!kindeUser.id || !kindeUser.email) {
    throw new Error("Kinde user ID and email are required");
  }

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.kindeUserId, kindeUser.id))
    .limit(1);

  const existingUser = existingUsers[0];

  if (existingUser) {
    return existingUser;
  }

  // first visit: create their work place

  const createAgencies = await db
    .insert(agencies)
    .values({
      name: kindeUser.given_name
        ? `${kindeUser.given_name}'s Agency`
        : "My Agency",
    })
    .returning();

  const agency = createAgencies[0];

  if (!agency) {
    throw new Error("could not create agency");
  }

  const createUsers = await db
    .insert(users)
    .values({
      kindeUserId: kindeUser.id,
      email: kindeUser.email,
      agencyId: agency.id,
      role: "owner",
    })
    .returning();

  return createUsers[0];
}
