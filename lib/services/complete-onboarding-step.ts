"use server";

import { db } from "@/db";
import { requireAgencyAdmin } from "./check-agency-admin";
import {
  clients,
  projectOnboardings,
  projectOnboardingSteps,
  projects,
} from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

type Props = {
  stepId: string;
  agencyId: string;
};

export async function updateOnboardingStep({ stepId, agencyId }: Props) {
  if (!stepId || !agencyId) {
    throw new Error("stepId and agencyId are required");
  }

  const user = await requireAgencyAdmin();

  if (user.agencyId !== agencyId) {
    throw new Error(
      "Access denied. You do not have permission to perform this action.",
    );
  }

  await db
    .update(projectOnboardingSteps)
    .set({ status: "completed" })
    .where(eq(projectOnboardingSteps.id, stepId))
    .returning();
}

type Props2 = {
  stepId: string;
  agencyId: string;
};

export async function completeOnboardingStep({ stepId, agencyId }: Props2) {
  return await db.transaction(async (tx) => {
    // 1. Find the step and verify that it belongs to this agency
    const stepData = await tx
      .select({
        stepId: projectOnboardingSteps.id,
        projectOnboardingId: projectOnboardings.id,
      })
      .from(projectOnboardingSteps)
      .innerJoin(
        projectOnboardings,
        eq(projectOnboardingSteps.projectOnboardingId, projectOnboardings.id),
      )
      .innerJoin(projects, eq(projectOnboardings.projectId, projects.id))
      .innerJoin(clients, eq(projects.clientId, clients.id))
      .where(
        and(
          eq(projectOnboardingSteps.id, stepId),
          eq(clients.agencyId, agencyId),
        ),
      )
      .limit(1);

    const step = stepData[0];

    if (!step) {
      throw new Error("Step not found or access denied.");
    }

    // 2. Mark the step as completed
    await tx
      .update(projectOnboardingSteps)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(projectOnboardingSteps.id, stepId));

    // 3. Get all steps belonging to this onboarding
    const allSteps = await tx
      .select({
        status: projectOnboardingSteps.status,
      })
      .from(projectOnboardingSteps)
      .where(
        eq(
          projectOnboardingSteps.projectOnboardingId,
          step.projectOnboardingId,
        ),
      )
      .orderBy(asc(projectOnboardingSteps.position));

    // 4. Calculate the new onboarding status
    const allCompleted = allSteps.every((step) => step.status === "completed");

    const someCompleted = allSteps.some((step) => step.status === "completed");

    let onboardingStatus: "not_started" | "in_progress" | "completed";

    if (allCompleted) {
      onboardingStatus = "completed";
    } else if (someCompleted) {
      onboardingStatus = "in_progress";
    } else {
      onboardingStatus = "not_started";
    }

    // 5. Update the parent onboarding
    await tx
      .update(projectOnboardings)
      .set({
        status: onboardingStatus,
        updatedAt: new Date(),
      })
      .where(eq(projectOnboardings.id, step.projectOnboardingId));
  });
}
