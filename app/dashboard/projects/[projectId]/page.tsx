import { db } from "@/db/index";
import {
  clients,
  projectOnboardings,
  projectOnboardingSteps,
  projects,
} from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";
import { markStepCompleteAction } from "@/app/dashboard/projects/actions";
import { eq, and, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireCurrentUser();

  const projectData = await db
    .select({
      projectName: projects.name,
      projectDescription: projects.description,
      clientName: clients.name,
      onboardingStatus: projectOnboardings.status,
      stepId: projectOnboardingSteps.id,
      stepTitle: projectOnboardingSteps.title,
      stepStatus: projectOnboardingSteps.status,
      stepPosition: projectOnboardingSteps.position,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .innerJoin(
      projectOnboardings,
      eq(projectOnboardings.projectId, projects.id),
    )
    .innerJoin(
      projectOnboardingSteps,
      eq(projectOnboardingSteps.projectOnboardingId, projectOnboardings.id),
    )
    .where(and(eq(projects.id, projectId), eq(clients.agencyId, user.agencyId)))
    .orderBy(asc(projectOnboardingSteps.position));

  // return notfound if the length === 0
  if (projectData.length === 0) {
    return notFound();
  }

  // project
  const project = projectData[0];

  // steps
  const steps = projectData.map((row) => ({
    id: row.stepId,
    title: row.stepTitle,
    status: row.stepStatus,
    position: row.stepPosition,
  }));

  // calculating progress
  const totalSteps = steps.length;
  const completedSteps = steps.filter(
    (step) => step.status === "completed",
  ).length;

  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="max-w-4xl mx-auto bg-gray-200 w-full p-4">
      <div className="flex flex-col gap-4 ">
        <h1>{project.projectName}</h1>
        <p>{project.projectDescription}</p>
        <p>Client: {project.clientName}</p>
        <p>Onboarding: {project.onboardingStatus}</p>
        <div className="mb-4">
          <p>Progress: {progress}%</p>
          <div className="w-full bg-gray-100 h-4">
            <div
              className="bg-green-400 rounded h-4"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>
      <h2>Onboarding Steps</h2>

      <div className="flex flex-col gap-4 mt-3">
        {steps.map((step) => (
          <div
            key={step.position}
            className={`${step.status === "completed" ? "bg-green-100" : "bg-gray-100"} p-2`}
          >
            <h3>{step.title}</h3>
            <p>Status: {step.status}</p>

            {step.status !== "completed" && (
              <form action={markStepCompleteAction}>
                <input type="hidden" name="stepId" value={step.id} />
                <input type="hidden" name="projectId" value={projectId} />

                <Button type="submit">Mark as complete</Button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
