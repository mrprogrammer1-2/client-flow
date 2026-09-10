import { db } from "@/db";
import {
  clientPortalAccess,
  clients,
  projectOnboardings,
  projectOnboardingSteps,
  projects,
} from "@/db/schema";
import { createHash } from "crypto";
import { eq, asc } from "drizzle-orm";

export async function getClientPortal(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [portalAccess] = await db
    .select()
    .from(clientPortalAccess)
    .where(eq(clientPortalAccess.tokenHash, tokenHash))
    .limit(1);

  if (!portalAccess) {
    return null;
  }

  if (portalAccess.revokedAt) {
    return null;
  }

  if (portalAccess.expiresAt && portalAccess.expiresAt < new Date()) {
    return null;
  }

  const info = await db
    .select({
      projectName: projects.name,
      clientName: clients.name,
      projectDescription: projects.description,
      onboardingStatus: projectOnboardings.status,
      stepId: projectOnboardingSteps.id,
      stepTitle: projectOnboardingSteps.title,
      stepStatus: projectOnboardingSteps.status,
      stepPosition: projectOnboardingSteps.position,
      stepType: projectOnboardingSteps.type,
      stepDescription: projectOnboardingSteps.description,
      stepRequired: projectOnboardingSteps.required,
    })
    .from(projectOnboardings)
    .innerJoin(projects, eq(projects.id, projectOnboardings.projectId))
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .innerJoin(
      projectOnboardingSteps,
      eq(projectOnboardingSteps.projectOnboardingId, projectOnboardings.id),
    )
    .where(eq(projectOnboardings.id, portalAccess.projectOnboardingId))
    .orderBy(asc(projectOnboardingSteps.position));

  if (!info.length) {
    return null;
  }

  const projectInfo = info[0];

  const steps = info.map((row) => ({
    id: row.stepId,
    title: row.stepTitle,
    status: row.stepStatus,
    position: row.stepPosition,
    type: row.stepType,
    description: row.stepDescription,
    required: row.stepRequired,
  }));

  const totalSteps = steps.length;
  const completedSteps = steps.filter(
    (step) => step.status === "completed",
  ).length;

  const progress =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  console.log("Token hash:", tokenHash);
  return {
    project: {
      name: projectInfo.projectName,
      description: projectInfo.projectDescription,
      clientName: projectInfo.clientName,
    },
    onboarding: {
      status: projectInfo.onboardingStatus,
      steps,
      progress,
    },
  };
}
