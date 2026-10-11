import { db } from "@/db";
import { users } from "@/db/schema";

type CreateInvitedUserProps = {
  kindeUserId: string;
  email: string;
  agencyId: string;
};

export default async function createInvitedUser({
  kindeUserId,
  email,
  agencyId,
}: CreateInvitedUserProps) {
  const [createUser] = await db
    .insert(users)
    .values({
      kindeUserId,
      email,
      agencyId,
      role: "member",
    })
    .returning();

  return createUser;
}
