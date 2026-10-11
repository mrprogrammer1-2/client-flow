import { invitations, users } from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";

type AcceptInvitationProps = {
  invitationId: string;
  kindeUserId: string;
  email: string;
};

export default async function acceptInvitation({
  invitationId,
  kindeUserId,
  email,
}: AcceptInvitationProps) {
  await db.transaction(async (tx) => {
    const [invitation] = await tx
      .select({ agencyId: invitations.agencyId })
      .from(invitations)
      .where(eq(invitations.id, invitationId))
      .limit(1);

    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    await tx.insert(users).values({
      kindeUserId,
      email,
      role: "member",
      agencyId: invitation.agencyId,
    });

    const [updatedInvitation] = await tx
      .update(invitations)
      .set({ status: "accepted" })
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.status, "pending"),
        ),
      )
      .returning({ id: invitations.id });

    if (!updatedInvitation) {
      throw new Error("Invitation is no longer pending.");
    }
  });
}
