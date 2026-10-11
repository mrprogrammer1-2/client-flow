import { db } from "@/db";
import { invitations } from "@/db/schema";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";

export default async function getInvitationByToken(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.tokenHash, tokenHash))
    .limit(1);

  if (!invitation) {
    return null;
  }

  return invitation;
}
