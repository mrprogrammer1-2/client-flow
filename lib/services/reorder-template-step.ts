import { db } from "@/db";
import { onboardingTemplates, onboardingTemplateSteps } from "@/db/schema";
import { eq, and, sql, gt, lt } from "drizzle-orm";

type ReorderStepProps = {
  stepId: string;
  newPosition: number;
  agencyId: string;
};

export async function reorderTemplateStep(params: ReorderStepProps) {
  const { stepId, newPosition, agencyId } = params;
  return await db.transaction(async (tx) => {
    const [step] = await tx
      .select({
        id: onboardingTemplateSteps.id,
        position: onboardingTemplateSteps.position,
        templateId: onboardingTemplateSteps.templateId,
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

    if (!step) {
      throw new Error("Step not found");
    }
    const oldPosition = step.position;

    if (oldPosition === newPosition) {
      return { templateId: step.templateId };
    }

    const steps = await tx
      .select({
        id: onboardingTemplateSteps.id,
        position: onboardingTemplateSteps.position,
      })
      .from(onboardingTemplateSteps)
      .where(eq(onboardingTemplateSteps.templateId, step.templateId));

    if (newPosition < 1 || newPosition > steps.length) {
      throw new Error("Invalid position.");
    }

    await tx
      .update(onboardingTemplateSteps)
      .set({ position: -1 })
      .where(eq(onboardingTemplateSteps.id, stepId));

    const TEMP_OFFSET = 1000000;

    await tx
      .update(onboardingTemplateSteps)
      .set({
        position: sql`${onboardingTemplateSteps.position} + ${TEMP_OFFSET}`,
      })
      .where(
        and(
          eq(onboardingTemplateSteps.templateId, step.templateId),
          oldPosition < newPosition
            ? gt(onboardingTemplateSteps.position, oldPosition)
            : gt(onboardingTemplateSteps.position, newPosition - 1),
          oldPosition < newPosition
            ? lt(onboardingTemplateSteps.position, newPosition + 1)
            : lt(onboardingTemplateSteps.position, oldPosition),
        ),
      );

    await tx
      .update(onboardingTemplateSteps)
      .set({
        position:
          oldPosition < newPosition
            ? sql`${onboardingTemplateSteps.position} - ${TEMP_OFFSET + 1}`
            : sql`${onboardingTemplateSteps.position} - ${TEMP_OFFSET - 1}`,
      })
      .where(
        and(
          eq(onboardingTemplateSteps.templateId, step.templateId),
          gt(onboardingTemplateSteps.position, TEMP_OFFSET),
        ),
      );

    await tx
      .update(onboardingTemplateSteps)
      .set({ position: newPosition })
      .where(eq(onboardingTemplateSteps.id, stepId));

    return {
      templateId: step.templateId,
    };
  });
}
