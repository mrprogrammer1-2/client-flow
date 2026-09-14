import { db } from "@/db";
import { clients, onboardingTemplates, projects } from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import CreateProjectForm from "./create-project-form";

export default async function ProjectsPage() {
  const user = await requireCurrentUser();

  const agencyProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      clientName: clients.name,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(clients.agencyId, user.agencyId));

  const agencyClients = await db
    .select({
      id: clients.id,
      name: clients.name,
    })
    .from(clients)
    .where(eq(clients.agencyId, user.agencyId))
    .orderBy(desc(clients.createdAt));

  const agencyTemplates = await db
    .select({
      id: onboardingTemplates.id,
      name: onboardingTemplates.name,
    })
    .from(onboardingTemplates)
    .where(eq(onboardingTemplates.agencyId, user.agencyId));

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CreateProjectForm clients={agencyClients} templates={agencyTemplates} />

      <div className="max-w-lg mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Projects</h2>
        <div className="flex flex-col gap-3">
          {agencyProjects.map((project) => (
            <Link
              href={`/dashboard/projects/${project.id}`}
              key={project.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition">{project.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[project.status ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">Client: {project.clientName}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
