import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";
import { and, eq } from "drizzle-orm";
import { restoreProjectAction } from "../actions";
import Link from "next/link";

export default async function ArchivedPage() {
  const user = await requireCurrentUser();

  const agencyArchivedProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      clientName: clients.name,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(
      and(eq(projects.status, "archived"), eq(clients.agencyId, user.agencyId)),
    );

  console.log(agencyArchivedProjects);

  return (
    <main className="p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-mono mb-3">Archived Projects</h1>
        <div className="flex flex-col gap-4 justify-center">
          {agencyArchivedProjects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <Link href={`/dashboard/projects/${project.id}`}>
                <h2>{project.name}</h2>
                <p>Client: {project.clientName}</p>
              </Link>
              <form action={restoreProjectAction}>
                <input type="hidden" name="projectId" value={project.id} />

                <button
                  type="submit"
                  className="rounded bg-green-600 px-4 py-2 text-white cursor-pointer"
                >
                  Restore Project
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
