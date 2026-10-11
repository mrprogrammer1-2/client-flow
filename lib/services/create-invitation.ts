import { db } from "@/db";
import { invitations } from "@/db/schema";
import { createHash, randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import validator from "validator";

type CreateInvitationProps = {
  agencyId: string;
  email: string;
  invitedBy: string;
};

export default async function createInvitation(inputs: CreateInvitationProps) {
  const { agencyId, email, invitedBy } = inputs;

  const normalizedEmail = email.trim().toLowerCase();

  if (!validator.isEmail(normalizedEmail)) {
    throw new Error("Invalid email address.");
  }

  const [pendingInvitation] = await db
    .select({ invitationStatus: invitations.status })
    .from(invitations)
    .where(
      and(
        eq(invitations.email, normalizedEmail),
        eq(invitations.agencyId, agencyId),
        eq(invitations.status, "pending"),
      ),
    )
    .limit(1);

  if (pendingInvitation) {
    throw new Error("A pending invitation already exists for this email.");
  }

  const token = randomBytes(32).toString("hex");

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(invitations).values({
    agencyId,
    email: normalizedEmail,
    invitedBy,
    tokenHash,
    expiresAt,
  });

  return { token };
}
