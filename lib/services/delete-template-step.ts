import { db } from "@/db";
import { onboardingTemplates, onboardingTemplateSteps } from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

type DeleteTemplateStepInput = {
  stepId: string;
  agencyId: string;
};

export async function deleteTemplateStep(input: DeleteTemplateStepInput) {
  const { stepId, agencyId } = input;

  return await db.transaction(async (tx) => {
    // 1. Find the step and verify that its template
    // belongs to the current agency.
    const [selectedStep] = await tx
      .select({
        templateId: onboardingTemplateSteps.templateId,
        position: onboardingTemplateSteps.position,
      })
      .from(onboardingTemplateSteps)
      .innerJoin(
        onboardingTemplates,
        eq(onboardingTemplateSteps.templateId, onboardingTemplates.id),
      )
      .where(
        and(
          eq(onboardingTemplateSteps.id, stepId),
          eq(onboardingTemplates.agencyId, agencyId),
        ),
      )
      .limit(1);

    if (!selectedStep) {
      throw new Error("Step not found.");
    }

    // 2. Delete the step.
    // Its template questions are deleted automatically
    // because of onDelete: "cascade".
    await tx
      .delete(onboardingTemplateSteps)
      .where(eq(onboardingTemplateSteps.id, stepId));

    // 3. Shift every step after the deleted step up by 1.
    await tx
      .update(onboardingTemplateSteps)
      .set({
        position: sql`${onboardingTemplateSteps.position} - 1`,
      })
      .where(
        and(
          eq(onboardingTemplateSteps.templateId, selectedStep.templateId),
          gt(onboardingTemplateSteps.position, selectedStep.position),
        ),
      );

    return {
      templateId: selectedStep.templateId,
    };
  });
}
