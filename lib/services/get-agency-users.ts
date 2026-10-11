import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export default async function getAgencyUsers(agencyId: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.agencyId, agencyId), eq(users.status, "active")));
}
