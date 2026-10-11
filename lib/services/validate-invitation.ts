import { db } from "@/db";
import { invitations } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Invitation } from "@/db/schema";

type ValidateInvitationType = {
  valid: boolean;
  reason: "valid" | "expired" | "already accepted" | "revoked";
};

export default async function validateInvitation(
  invitation: Invitation,
): Promise<ValidateInvitationType> {
  if (invitation?.status === "pending") {
    const now = new Date();
    if (invitation?.expiresAt <= now) {
      await db
        .update(invitations)
        .set({ status: "expired" })
        .where(eq(invitations.id, invitation.id))
        .returning();

      return { valid: false, reason: "expired" };
    } else {
      return { valid: true, reason: "valid" };
    }
  } else if (invitation?.status === "accepted") {
    return { valid: false, reason: "already accepted" };
  } else if (invitation?.status === "revoked") {
    return { valid: false, reason: "revoked" };
  } else {
    return { valid: false, reason: "expired" };
  }
}
