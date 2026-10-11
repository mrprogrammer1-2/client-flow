"use server";

import canManageUser from "@/lib/services/can-manage-user";
import { requireCurrentUser } from "@/lib/services/current-user";
import updateUserRole from "@/lib/services/update-user-role";

import type { UserRole } from "@/lib/services/can-manage-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import canAssignRole from "@/lib/services/can-assign-role";
import { revalidatePath } from "next/cache";
import removeUser from "@/lib/services/remove-user";

export async function updateUserRoleAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "").trim();
  const newRoleValue = String(formData.get("newRole") ?? "").trim();

  if (!userId || !newRoleValue) {
    throw new Error("User ID and new role are required.");
  }

  if (newRoleValue !== "admin" && newRoleValue !== "member") {
    throw new Error("Invalid role.");
  }

  const newRole: UserRole = newRoleValue;

  const currentUser = await requireCurrentUser();

  const [targetUser] = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.agencyId, currentUser.agencyId)))
    .limit(1);

  if (!targetUser) {
    throw new Error("User not found.");
  }

  if (targetUser.id === currentUser.id) {
    throw new Error("You cannot change your own role.");
  }

  const canUpdate = canManageUser({
    currentRole: currentUser.role,
    targetRole: targetUser.role,
  });

  const canAssign = canAssignRole({
    currentRole: currentUser.role,
    newRole: newRole,
  });

  if (!canUpdate || !canAssign) {
    throw new Error("You do not have permission to update this user's role.");
  }

  await updateUserRole({
    userId: targetUser.id,
    agencyId: currentUser.agencyId,
    newRole,
  });

  revalidatePath("/dashboard/users");
}

export async function removeUserAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    throw new Error("User ID is required.");
  }

  const currentUser = await requireCurrentUser();

  if (userId === currentUser.id) {
    throw new Error("You cannot remove yourself.");
  }

  const [targetUser] = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.agencyId, currentUser.agencyId)))
    .limit(1);

  if (!targetUser) {
    throw new Error("User not found.");
  }

  const canRemove = canManageUser({
    currentRole: currentUser.role,
    targetRole: targetUser.role,
  });

  if (!canRemove) {
    throw new Error("You do not have permission to remove this user.");
  }

  await removeUser({
    userId: targetUser.id,
    agencyId: currentUser.agencyId,
  });

  revalidatePath("/dashboard/users");
}
