import { db } from "@/db";
import { onboardingTemplates } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import syncTemplateStatus from "./sync-template-status";

type RestoreTemplateProps = {
  templateId: string;
  agencyId: string;
};

export default async function restoreTemplate({
  templateId,
  agencyId,
}: RestoreTemplateProps) {
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

  const [restoredTemplate] = await db
    .update(onboardingTemplates)
    .set({ status: "inactive" })
    .where(
      and(
        eq(onboardingTemplates.id, templateId),
        eq(onboardingTemplates.agencyId, agencyId),
        eq(onboardingTemplates.status, "archived"),
      ),
    )
    .returning();

  if (!restoredTemplate) {
    throw new Error("Template could not be restored.");
  }

  await syncTemplateStatus(templateId);
}
