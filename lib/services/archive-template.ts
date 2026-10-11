import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { onboardingTemplates } from "@/db/schema";

type ArchiveTemplateProps = {
  templateId: string;
  agencyId: string;
};

export default async function archiveTemplate({
  templateId,
  agencyId,
}: ArchiveTemplateProps) {
  const [template] = await db
    .select()
    .from(onboardingTemplates)
    .where(
      and(
        eq(onboardingTemplates.id, templateId),
        eq(onboardingTemplates.agencyId, agencyId),
      ),
    )
    .limit(1);

  if (!template) {
    throw new Error("Template not found.");
  }

  if (template.status === "archived") {
    return template;
  }

  const [updatedTemplate] = await db
    .update(onboardingTemplates)
    .set({ status: "archived" })
    .where(
      and(
        eq(onboardingTemplates.id, templateId),
        eq(onboardingTemplates.agencyId, agencyId),
      ),
    )
    .returning();

  if (!updatedTemplate) {
    throw new Error("Template could not be archived.");
  }

  return updatedTemplate;
}
