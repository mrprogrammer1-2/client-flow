import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type RemoveUserProps = {
  userId: string;
  agencyId: string;
};

export default async function removeUser({
  userId,
  agencyId,
}: RemoveUserProps) {
  if (!userId || !agencyId) {
    throw new Error("User ID and agency ID are required.");
  }

  const result = await db
    .update(users)
    .set({ status: "removed" })
    .where(and(eq(users.id, userId), eq(users.agencyId, agencyId)))
    .returning({
      id: users.id,
      status: users.status,
    });

  if (result.length === 0) {
    throw new Error("User not found.");
  }

  return result[0];
}
