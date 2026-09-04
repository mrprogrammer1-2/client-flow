"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ensureUserAndAgency } from "./ensure-user";

export async function requireCurrentUser() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  if (!kindeUser) {
    throw new Error("User not found");
  }

  const ensuredUser = await ensureUserAndAgency({
    id: kindeUser.id,
    email: kindeUser.email,
    given_name: kindeUser.given_name,
  });

  const user = { ...ensuredUser, kindeUser };

  return user;
}
