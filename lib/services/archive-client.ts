import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type ArchiveClientProps = {
  clientId: string;
  agencyId: string;
};

export default async function archiveClient(params: ArchiveClientProps) {
  const { clientId, agencyId } = params;

  const result = await db
    .update(clients)
    .set({
      status: "archived",
      updatedAt: new Date(),
    })
    .where(and(eq(clients.id, clientId), eq(clients.agencyId, agencyId)));

  if (result.rowCount === 0) {
    return null;
  }

  return { success: true };
}
