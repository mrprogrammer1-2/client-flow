import "server-only";

import { createHash, randomInt } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  clientPortalAccess,
  clientPortalVerifications,
  clients,
  projectOnboardings,
  projects,
} from "@/db/schema";
import { resend } from "@/lib/emails/resend";
import ClientPortalVerificationEmail from "@/lib/emails/client-portal-verification";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashCode(code: string) {
  const secret = process.env.PORTAL_VERIFICATION_SECRET;

  if (!secret) {
    throw new Error("PORTAL_VERIFICATION_SECRET is missing.");
  }

  return createHash("sha256").update(`${secret}:${code}`).digest("hex");
}

export async function sendClientPortalVerification(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [portalAccess] = await db
    .select({
      id: clientPortalAccess.id,
      revokedAt: clientPortalAccess.revokedAt,
      expiresAt: clientPortalAccess.expiresAt,
      projectOnboardingId: clientPortalAccess.projectOnboardingId,
    })
    .from(clientPortalAccess)
    .where(eq(clientPortalAccess.tokenHash, tokenHash))
    .limit(1);

  if (
    !portalAccess ||
    portalAccess.revokedAt ||
    (portalAccess.expiresAt && portalAccess.expiresAt < new Date())
  ) {
    throw new Error("Invalid or expired portal link.");
  }

  const [project] = await db
    .select({
      projectName: projects.name,
      clientEmail: clients.email,
    })
    .from(projectOnboardings)
    .innerJoin(projects, eq(projects.id, projectOnboardings.projectId))
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(projectOnboardings.id, portalAccess.projectOnboardingId))
    .limit(1);

  if (!project) {
    throw new Error("Project not found.");
  }

  const [existingVerification] = await db
    .select()
    .from(clientPortalVerifications)
    .where(eq(clientPortalVerifications.clientPortalAccessId, portalAccess.id))
    .limit(1);

  const now = new Date();

  if (
    existingVerification &&
    now.getTime() - existingVerification.lastSentAt.getTime() <
      RESEND_COOLDOWN_MS
  ) {
    throw new Error("Please wait before requesting another code.");
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = hashCode(code);
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS);

  if (existingVerification) {
    await db
      .update(clientPortalVerifications)
      .set({
        codeHash,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
      })
      .where(eq(clientPortalVerifications.id, existingVerification.id));
  } else {
    await db.insert(clientPortalVerifications).values({
      clientPortalAccessId: portalAccess.id,
      codeHash,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    });
  }

  const { error } = await resend.emails.send({
    from: process.env.PORTAL_FROM_EMAIL!,
    to: project.clientEmail,
    subject: `Your verification code for ${project.projectName}`,
    react: ClientPortalVerificationEmail({
      code,
      projectName: project.projectName,
    }),
  });

  if (error) {
    if (existingVerification) {
      await db
        .update(clientPortalVerifications)
        .set({
          lastSentAt: existingVerification.lastSentAt,
          codeHash: existingVerification.codeHash,
          expiresAt: existingVerification.expiresAt,
          attempts: existingVerification.attempts,
        })
        .where(eq(clientPortalVerifications.id, existingVerification.id));
    } else {
      await db
        .delete(clientPortalVerifications)
        .where(
          eq(clientPortalVerifications.clientPortalAccessId, portalAccess.id),
        );
    }

    throw new Error("Could not send verification email.");
  }

  return { success: true };
}
