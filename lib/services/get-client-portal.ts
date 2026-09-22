import { db } from "@/db";
import {
  clientPortalAccess,
  clients,
  projectOnboardings,
  projectOnboardingQuestions,
  projectOnboardingSteps,
  projects,
} from "@/db/schema";
import { createHash } from "crypto";
import { eq, asc, inArray } from "drizzle-orm";

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

  const rows = await db
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

  if (!rows.length) {
    return null;
  }

  const projectRow = rows[0];

  const questions =
    rows.length > 0
      ? await db
          .select({
            id: projectOnboardingQuestions.id,
            stepId: projectOnboardingQuestions.projectOnboardingStepId,
            question: projectOnboardingQuestions.question,
            position: projectOnboardingQuestions.position,
          })
          .from(projectOnboardingQuestions)
          .where(
            inArray(
              projectOnboardingQuestions.projectOnboardingStepId,
              rows.map((row) => row.stepId),
            ),
          )
          .orderBy(asc(projectOnboardingQuestions.position))
      : [];

  const steps = rows.map((row) => ({
    id: row.stepId,
    title: row.stepTitle,
    status: row.stepStatus,
    position: row.stepPosition,
    type: row.stepType,
    description: row.stepDescription,
    required: row.stepRequired,
    questions: questions.filter((question) => question.stepId === row.stepId),
  }));

  const totalSteps = steps.length;
  const completedSteps = steps.filter(
    (step) => step.status === "completed",
  ).length;

  const progress =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  return {
    project: {
      name: projectRow.projectName,
      description: projectRow.projectDescription,
      clientName: projectRow.clientName,
    },
    onboarding: {
      status: projectRow.onboardingStatus,
      steps,
      progress,
    },
  };
}
