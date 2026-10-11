import { createHash, createHmac, randomInt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  clientPortalAccess,
  clientPortalVerifications,
  clients,
  projectOnboardings,
  projects,
} from "@/db/schema";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const VERIFIED_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getSessionSecret() {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("PORTAL_SESSION_SECRET must be set to a random value of at least 32 characters.");
  }
  return secret;
}

function cookieName(tokenHash: string) {
  return `cf_portal_${tokenHash.slice(0, 24)}`;
}

function signSession(tokenHash: string, expiresAt: number) {
  return createHmac("sha256", getSessionSecret())
    .update(`${tokenHash}.${expiresAt}`)
    .digest("hex");
}

export async function getClientPortalAccessContext(token: string) {
  if (!token || token.length > 512) return null;
  const tokenHash = hash(token);
  const [context] = await db
    .select({
      id: clientPortalAccess.id,
      projectOnboardingId: clientPortalAccess.projectOnboardingId,
      expiresAt: clientPortalAccess.expiresAt,
      revokedAt: clientPortalAccess.revokedAt,
      clientEmail: clients.email,
    })
    .from(clientPortalAccess)
    .innerJoin(projectOnboardings, eq(projectOnboardings.id, clientPortalAccess.projectOnboardingId))
    .innerJoin(projects, eq(projects.id, projectOnboardings.projectId))
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(clientPortalAccess.tokenHash, tokenHash))
    .limit(1);

  if (!context || context.revokedAt || (context.expiresAt && context.expiresAt < new Date())) {
    return null;
  }

  return { ...context, tokenHash };
}

export function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "your registered email address";
  const visible = localPart.length < 3 ? localPart.slice(0, 1) : localPart.slice(0, 2);
  return `${visible}${"•".repeat(Math.min(6, Math.max(3, localPart.length - visible.length)))}@${domain}`;
}

export async function requestClientPortalVerification(token: string) {
  const context = await getClientPortalAccessContext(token);
  if (!context) return;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PORTAL_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Portal email verification is not configured. Set RESEND_API_KEY and PORTAL_FROM_EMAIL.");
  }

  const [existing] = await db
    .select({ lastSentAt: clientPortalVerifications.lastSentAt })
    .from(clientPortalVerifications)
    .where(eq(clientPortalVerifications.portalAccessId, context.id))
    .limit(1);

  if (existing && Date.now() - existing.lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    // Do not reveal rate-limit state or whether an email address exists.
    return;
  }

  const code = String(randomInt(100000, 1000000));
  const now = new Date();
  await db
    .insert(clientPortalVerifications)
    .values({
      portalAccessId: context.id,
      codeHash: hash(`${context.tokenHash}:${code}`),
      expiresAt: new Date(now.getTime() + CODE_TTL_MS),
      lastSentAt: now,
      attempts: 0,
      usedAt: null,
    })
    .onConflictDoUpdate({
      target: clientPortalVerifications.portalAccessId,
      set: {
        codeHash: hash(`${context.tokenHash}:${code}`),
        expiresAt: new Date(now.getTime() + CODE_TTL_MS),
        lastSentAt: now,
        attempts: 0,
        usedAt: null,
      },
    });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [context.clientEmail],
        subject: "Your ClientFlow verification code",
        text: `Your ClientFlow verification code is ${code}. It expires in 10 minutes. If you did not request access, you can ignore this email.`,
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Email provider rejected the request.");
  } catch {
    // Invalidate the unsent code rather than leave a usable challenge in the database.
    await db.delete(clientPortalVerifications).where(eq(clientPortalVerifications.portalAccessId, context.id));
    throw new Error("Could not send the portal verification email.");
  }
}

export async function verifyClientPortalCode(token: string, suppliedCode: string) {
  const context = await getClientPortalAccessContext(token);
  if (!context || !/^\d{6}$/.test(suppliedCode)) return false;

  const [challenge] = await db
    .select()
    .from(clientPortalVerifications)
    .where(eq(clientPortalVerifications.portalAccessId, context.id))
    .limit(1);

  if (!challenge || challenge.usedAt || challenge.expiresAt < new Date() || challenge.attempts >= MAX_ATTEMPTS) {
    return false;
  }

  const expected = Buffer.from(challenge.codeHash, "hex");
  const actual = Buffer.from(hash(`${context.tokenHash}:${suppliedCode}`), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    await db.update(clientPortalVerifications)
      .set({ attempts: challenge.attempts + 1 })
      .where(and(
        eq(clientPortalVerifications.id, challenge.id),
        eq(clientPortalVerifications.attempts, challenge.attempts),
      ));
    return false;
  }

  const now = new Date();
  const updated = await db.update(clientPortalVerifications)
    .set({ usedAt: now })
    .where(and(
      eq(clientPortalVerifications.id, challenge.id),
      eq(clientPortalVerifications.attempts, challenge.attempts),
      isNull(clientPortalVerifications.usedAt),
      gt(clientPortalVerifications.expiresAt, new Date()),
    ))
    .returning({ id: clientPortalVerifications.id });
  if (!updated.length) return false;

  const expiresAt = now.getTime() + VERIFIED_SESSION_TTL_MS;
  const cookieStore = await cookies();
  cookieStore.set(cookieName(context.tokenHash), `${expiresAt}.${signSession(context.tokenHash, expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: `/client-portal/${token}`,
    expires: new Date(expiresAt),
  });
  return true;
}

export async function isClientPortalSessionVerified(token: string) {
  const context = await getClientPortalAccessContext(token);
  if (!context) return false;

  const cookieStore = await cookies();
  const value = cookieStore.get(cookieName(context.tokenHash))?.value;
  if (!value) return false;
  const [expiresAtText, signature] = value.split(".");
  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() || !signature) return false;

  const expected = Buffer.from(signSession(context.tokenHash, expiresAt), "hex");
  const actual = Buffer.from(signature, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
