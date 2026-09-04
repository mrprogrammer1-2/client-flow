"use server";

import { requireCurrentUser } from "./current-user";

export async function requireAgencyAdmin() {
  const user = await requireCurrentUser();
  const role = user.role;
  if (role !== "admin" && role !== "owner") {
    throw new Error(
      "Access denied. You do not have permission to perform this action.",
    );
  }

  return user;
}
