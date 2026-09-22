import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type Props = {
  projectId: string;
  agencyId: string;
};

export async function restoreProject({ projectId, agencyId }: Props) {
  return await db.transaction(async (tx) => {
    const projectData = await tx
      .select()
      .from(projects)
      .innerJoin(clients, eq(clients.id, projects.clientId))
      .where(and(eq(projects.id, projectId), eq(clients.agencyId, agencyId)))
      .limit(1);

    if (!projectData.length) {
      return null;
    }

    await tx
      .update(projects)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    return { success: true };
  });
}
