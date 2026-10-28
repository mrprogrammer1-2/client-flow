import "server-only";

import { createHash } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clientPortalAccess } from "@/db/schema";

export async function getClientPortalAccess(token: string) {
  if (!token || token.length > 200) {
    return null;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [access] = await db
    .select({
      id: clientPortalAccess.id,
      revokedAt: clientPortalAccess.revokedAt,
      expiresAt: clientPortalAccess.expiresAt,
    })
    .from(clientPortalAccess)
    .where(eq(clientPortalAccess.tokenHash, tokenHash))
    .limit(1);

  if (
    !access ||
    access.revokedAt ||
    (access.expiresAt && access.expiresAt <= new Date())
  ) {
    return null;
  }

  return { id: access.id };
}
