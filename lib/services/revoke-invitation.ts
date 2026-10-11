import { db } from "@/db";
import { invitations } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type RevokeInvitationProps = {
  invitationId: string;
  agencyId: string;
};

export default async function RevokeInvitation({
  invitationId,
  agencyId,
}: RevokeInvitationProps) {
  if (!invitationId || !agencyId) {
    throw new Error("Invitation ID and agency ID are required.");
  }

  const result = await db
    .update(invitations)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(
      and(
        eq(invitations.id, invitationId),
        eq(invitations.agencyId, agencyId),
        eq(invitations.status, "pending"),
      ),
    )
    .returning({
      id: invitations.id,
      status: invitations.status,
      revokedAt: invitations.revokedAt,
    });

  if (result.length === 0) {
    throw new Error("Invitation not found or already revoked.");
  }

  return result[0];
}
