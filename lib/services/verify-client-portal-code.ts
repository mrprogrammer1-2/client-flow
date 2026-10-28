import "server-only";

import { createHash, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clientPortalAccess, clientPortalVerifications } from "@/db/schema";
import { createClientPortalSession } from "@/lib/services/client-portal-session";

const MAX_ATTEMPTS = 5;

function hashCode(code: string) {
  const secret = process.env.PORTAL_VERIFICATION_SECRET;

  if (!secret) {
    throw new Error("PORTAL_VERIFICATION_SECRET is missing.");
  }

  return createHash("sha256").update(`${secret}:${code}`).digest("hex");
}

function hashesMatch(actualHash: string, expectedHash: string) {
  const actual = Buffer.from(actualHash, "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function verifyClientPortalCode(
  token: string,
  submittedCode: string,
) {
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [portalAccess] = await db
    .select({
      id: clientPortalAccess.id,
      revokedAt: clientPortalAccess.revokedAt,
      expiresAt: clientPortalAccess.expiresAt,
    })
    .from(clientPortalAccess)
    .where(eq(clientPortalAccess.tokenHash, tokenHash))
    .limit(1);

  if (
    !portalAccess ||
    portalAccess.revokedAt ||
    (portalAccess.expiresAt && portalAccess.expiresAt <= new Date())
  ) {
    return {
      success: false as const,
      error: "Invalid or expired portal link.",
    };
  }

  const [verification] = await db
    .select()
    .from(clientPortalVerifications)
    .where(eq(clientPortalVerifications.clientPortalAccessId, portalAccess.id))
    .limit(1);

  if (!verification || verification.expiresAt <= new Date()) {
    return {
      success: false as const,
      error: "Your code has expired. Request a new one.",
    };
  }

  if (verification.attempts >= MAX_ATTEMPTS) {
    return {
      success: false as const,
      error: "Too many attempts. Request a new code.",
    };
  }

  if (!/^\d{6}$/.test(submittedCode)) {
    return { success: false as const, error: "Enter the six-digit code." };
  }

  const submittedHash = hashCode(submittedCode);

  if (!hashesMatch(submittedHash, verification.codeHash)) {
    await db
      .update(clientPortalVerifications)
      .set({ attempts: verification.attempts + 1 })
      .where(eq(clientPortalVerifications.id, verification.id));

    return { success: false as const, error: "Incorrect code." };
  }

  // Consume the code so it cannot be used to create another session.
  await db
    .delete(clientPortalVerifications)
    .where(eq(clientPortalVerifications.id, verification.id));

  await createClientPortalSession(portalAccess.id);

  return { success: true as const };
}
