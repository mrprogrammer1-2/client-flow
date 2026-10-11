import { db } from "@/db";
import { onboardingTemplates, onboardingTemplateSteps } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";

type UpdateTemplateStepInput = {
  stepId: string;
  agencyId: string;
  title: string;
  description?: string;
  required: boolean;
};

export async function updateTemplateStep(input: UpdateTemplateStepInput) {
  const { stepId, agencyId, title, description, required } = input;

  const [step] = await db
    .select({
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
        ne(onboardingTemplates.status, "archived"),
      ),
    )
    .limit(1);

  if (!step) {
    throw new Error("Step not found.");
  }

  const [updatedStep] = await db
    .update(onboardingTemplateSteps)
    .set({
      title,
      description: description || null,
      required,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(onboardingTemplateSteps.id, stepId),
        eq(onboardingTemplateSteps.templateId, step.templateId),
      ),
    )
    .returning();

  if (!updatedStep) {
    throw new Error("Step could not be updated.");
  }

  return {
    ...updatedStep,
    templateId: step.templateId,
  };
}
