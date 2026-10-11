import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { and, eq, exists } from "drizzle-orm";

type Props = {
  projectId: string;
  agencyId: string;
};

export async function archiveProject({ projectId, agencyId }: Props) {
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

    const [archivedProject] = await tx
      .update(projects)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projects.id, projectId),
          exists(
            tx
              .select({ id: clients.id })
              .from(clients)
              .where(
                and(
                  eq(clients.id, projects.clientId),
                  eq(clients.agencyId, agencyId),
                ),
              ),
          ),
        ),
      )
      .returning({ id: projects.id });

    if (!archivedProject) {
      return null;
    }

    return { success: true };
  });
}
