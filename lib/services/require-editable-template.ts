import { db } from "@/db";
import { onboardingTemplates } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type RequireEditableTemplateProps = {
  templateId: string;
  agencyId: string;
};

export default async function requireEditableTemplate({
  templateId,
  agencyId,
}: RequireEditableTemplateProps) {
  const [template] = await db
    .select({ status: onboardingTemplates.status })
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
    throw new Error("Archived templates cannot be edited.");
  }

  return template;
}
