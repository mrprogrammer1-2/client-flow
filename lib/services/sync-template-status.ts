import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { onboardingTemplates, onboardingTemplateSteps } from "@/db/schema";

export default async function syncTemplateStatus(templateId: string) {
  const [template] = await db
    .select({
      status: onboardingTemplates.status,
    })
    .from(onboardingTemplates)
    .where(eq(onboardingTemplates.id, templateId))
    .limit(1);

  if (!template) {
    throw new Error("Template not found.");
  }

  // Archived templates must remain archived.
  if (template.status === "archived") {
    return;
  }

  const [requiredStep] = await db
    .select({
      id: onboardingTemplateSteps.id,
    })
    .from(onboardingTemplateSteps)
    .where(
      and(
        eq(onboardingTemplateSteps.templateId, templateId),
        eq(onboardingTemplateSteps.required, true),
      ),
    )
    .limit(1);

  const status = requiredStep ? "active" : "inactive";

  await db
    .update(onboardingTemplates)
    .set({
      status,
    })
    .where(eq(onboardingTemplates.id, templateId));
}
