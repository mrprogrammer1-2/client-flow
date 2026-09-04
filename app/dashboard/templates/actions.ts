"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { onboardingTemplates } from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";

export async function createTemplateAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    throw new Error("Template name is required.");
  }

  const user = await requireCurrentUser();

  await db.insert(onboardingTemplates).values({
    agencyId: user.agencyId,
    name,
    description: description || null,
  });

  revalidatePath("/dashboard/templates");
}
