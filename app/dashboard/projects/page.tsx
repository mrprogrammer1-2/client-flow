import { db } from "@/db";
import { clients, onboardingTemplates, projects } from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";
import { eq, desc } from "drizzle-orm";
import { createProjectAction } from "./actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  return (
    <div className="p-4 flex flex-col gap-4 items-center">
      <form
        action={createProjectAction}
        className="flex flex-col gap-4 w-full max-w-md border border-gray-300 p-4 rounded"
      >
        <input
          name="name"
          placeholder="Project name"
          required
          className=" border border-gray-200 p-2 rounded bg-gray-100"
        />
        <textarea
          name="description"
          placeholder="Project description"
          className="border border-gray-200 p-2 rounded bg-gray-100"
        />
        <select
          name="clientId"
          required
          className="border border-gray-200 p-2 rounded bg-gray-100"
        >
          {agencyClients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <select
          name="templateId"
          required
          className="border border-gray-200 p-2 rounded bg-gray-100"
        >
          {agencyTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <Button type="submit" className={"cursor-pointer"}>
          Create Project
        </Button>
      </form>
      <h1>Projects</h1>
      {agencyProjects.map((project) => (
        <Link
          href={`/dashboard/projects/${project.id}`}
          key={project.id}
          className="cursor-pointer bg-pink-300 p-4 rounded-2xl w-full max-w-3xl flex flex-col justify-center"
        >
          <h2>name:{project.name}</h2>
          <p>description: {project.description}</p>
          <p>Status: {project.status}</p>
          <p>Client: {project.clientName}</p>
        </Link>
      ))}
    </div>
  );
}
