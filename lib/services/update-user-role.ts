import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { UserRole } from "./can-manage-user";

type UpdateUserRoleProps = {
  userId: string;
  agencyId: string;
  newRole: UserRole;
};

export default async function updateUserRole({
  userId,
  agencyId,
  newRole,
}: UpdateUserRoleProps) {
  const result = await db
    .update(users)
    .set({
      role: newRole,
    })
    .where(and(eq(users.id, userId), eq(users.agencyId, agencyId)))
    .returning({
      id: users.id,
      role: users.role,
    });

  if (result.length === 0) {
    throw new Error("User not found.");
  }

  return result[0];
}
