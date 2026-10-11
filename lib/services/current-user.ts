"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ensureUserAndAgency } from "./ensure-user";
import { redirect } from "next/navigation";

export async function getAuthenticatedKindeUser() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  if (!kindeUser) {
    // Keep the server-side guard authoritative even if middleware is misconfigured.
    redirect("/api/auth/login");
  }

  return kindeUser;
}

export async function requireCurrentUser() {
  const kindeUser = await getAuthenticatedKindeUser();

  const ensuredUser = await ensureUserAndAgency({
    id: kindeUser.id,
    email: kindeUser.email,
    given_name: kindeUser.given_name,
  });

  const user = { ...ensuredUser, kindeUser };

  return user;
}
