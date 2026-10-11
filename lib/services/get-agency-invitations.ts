import { db } from "@/db";
import { invitations, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export default async function getAgencyInvitations(agencyId: string) {
  return db
    .select({
      id: invitations.id,
      email: invitations.email,
      invitedByEmail: users.email,
      createdAt: invitations.createdAt,
      expiresAt: invitations.expiresAt,
    })
    .from(invitations)
    .innerJoin(users, eq(invitations.invitedBy, users.id))
    .where(
      and(
        eq(invitations.agencyId, agencyId),
        eq(invitations.status, "pending"),
      ),
    );
}
