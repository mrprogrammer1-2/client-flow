import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_TTL_SECONDS = 24 * 60 * 60;
const COOKIE_PREFIX = "client_portal_session_";

function getSessionSecret() {
  const secret = process.env.PORTAL_VERIFICATION_SECRET;

  if (!secret) {
    throw new Error("PORTAL_VERIFICATION_SECRET is missing.");
  }

  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createCookieName(portalAccessId: string) {
  return `${COOKIE_PREFIX}${portalAccessId}`;
}

export async function createClientPortalSession(portalAccessId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${portalAccessId}.${expiresAt}`;
  const signature = signPayload(payload);

  const cookieStore = await cookies();

  cookieStore.set(createCookieName(portalAccessId), `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/client-portal",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function hasValidClientPortalSession(portalAccessId: string) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(createCookieName(portalAccessId));

  if (!cookie) {
    return false;
  }

  const [cookieAccessId, expiresAtText, signature, ...extra] =
    cookie.value.split(".");

  if (
    !cookieAccessId ||
    !expiresAtText ||
    !signature ||
    extra.length > 0 ||
    cookieAccessId !== portalAccessId ||
    !/^\d+$/.test(expiresAtText)
  ) {
    return false;
  }

  const expiresAt = Number(expiresAtText);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const payload = `${cookieAccessId}.${expiresAtText}`;
  const expectedSignature = signPayload(payload);

  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return false;
  }

  return true;
}
