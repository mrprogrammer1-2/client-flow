import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { and, eq, exists } from "drizzle-orm";

type DeleteProjectProps = {
  projectId: string;
  agencyId: string;
};

export default async function deleteProject({
  projectId,
  agencyId,
}: DeleteProjectProps) {
  const [deletedProject] = await db
    .delete(projects)
    .where(
      and(
        eq(projects.id, projectId),
        exists(
          db
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
    .returning({
      id: projects.id,
    });

  if (!deletedProject) {
    throw new Error("Project could not be deleted.");
  }

  return deletedProject;
}
