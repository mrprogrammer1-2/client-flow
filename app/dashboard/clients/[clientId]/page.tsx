import { and, desc, eq } from "drizzle-orm";
import { ArrowLeft, BriefcaseBusiness, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, projectOnboardings, projects } from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";
import { archiveClientAction } from "../actions";

const projectStatusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  completed: "bg-sky-50 text-sky-700",
  archived: "bg-gray-100 text-gray-600",
};

const onboardingStatusStyles: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-600",
  in_progress: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
};

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const user = await requireCurrentUser();

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.agencyId, user.agencyId)))
    .limit(1);

  if (!client) {
    notFound();
  }

  const clientProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      createdAt: projects.createdAt,
      onboardingStatus: projectOnboardings.status,
    })
    .from(projects)
    .leftJoin(projectOnboardings, eq(projectOnboardings.projectId, projects.id))
    .where(eq(projects.clientId, client.id))
    .orderBy(desc(projects.createdAt));

  const activeProjects = clientProjects.filter(
    (project) => project.status === "active",
  ).length;
  const completedProjects = clientProjects.filter(
    (project) => project.status === "completed",
  ).length;

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 px-4 py-8 sm:px-8">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        All clients
      </Link>

      <header className="flex flex-col justify-between gap-5 border-b border-gray-200 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-gray-500">Client details</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
            {client.companyName}
          </h1>
          <p className="mt-1 text-gray-600">{client.name}</p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${
            client.status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {client.status}
        </span>
      </header>

      {client.status !== "archived" && (
        <form action={archiveClientAction}>
          <input type="hidden" name="clientId" value={clientId} />

          <button
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-white cursor-pointer"
          >
            archive Client
          </button>
        </form>
      )}

      <section
        aria-label="Client overview"
        className="grid gap-8 md:grid-cols-3"
      >
        <div className="space-y-4 md:col-span-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">Contact</h2>
            <p className="mt-1 text-sm text-gray-500">
              Client since {client.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div className="divide-y divide-gray-100 border-y border-gray-200">
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-3 py-4 text-sm text-gray-700 hover:text-gray-950"
            >
              <Mail aria-hidden="true" size={17} className="text-gray-400" />
              {client.email}
            </a>
            {client.phone ? (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-3 py-4 text-sm text-gray-700 hover:text-gray-950"
              >
                <Phone aria-hidden="true" size={17} className="text-gray-400" />
                {client.phone}
              </a>
            ) : (
              <p className="flex items-center gap-3 py-4 text-sm text-gray-400">
                <Phone aria-hidden="true" size={17} />
                No phone number provided
              </p>
            )}
          </div>
        </div>

        <aside className="grid grid-cols-2 gap-4 md:grid-cols-1">
          <div className="border-l-2 border-gray-900 pl-4">
            <p className="text-2xl font-semibold text-gray-950">
              {clientProjects.length}
            </p>
            <p className="text-sm text-gray-500">Total projects</p>
          </div>
          <div className="border-l-2 border-emerald-600 pl-4">
            <p className="text-2xl font-semibold text-gray-950">
              {activeProjects}
            </p>
            <p className="text-sm text-gray-500">Active projects</p>
          </div>
          <div className="border-l-2 border-sky-600 pl-4">
            <p className="text-2xl font-semibold text-gray-950">
              {completedProjects}
            </p>
            <p className="text-sm text-gray-500">Completed projects</p>
          </div>
        </aside>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">Projects</h2>
            <p className="mt-1 text-sm text-gray-500">
              Work and onboarding activity for this client.
            </p>
          </div>
          <span className="text-sm tabular-nums text-gray-500">
            {clientProjects.length}
          </span>
        </div>

        {clientProjects.length === 0 ? (
          <div className="py-10 text-center">
            <BriefcaseBusiness
              aria-hidden="true"
              size={22}
              className="mx-auto text-gray-400"
            />
            <p className="mt-3 font-medium text-gray-800">No projects yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Projects created for this client will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {clientProjects.map((project) => (
              <li key={project.id} className="py-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="font-medium text-gray-950 hover:underline"
                    >
                      {project.name}
                    </Link>
                    {project.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {project.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-gray-400">
                      Created {project.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${projectStatusStyles[project.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {project.status}
                    </span>
                    {project.onboardingStatus ? (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${onboardingStatusStyles[project.onboardingStatus] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        Onboarding:{" "}
                        {project.onboardingStatus.replaceAll("_", " ")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
