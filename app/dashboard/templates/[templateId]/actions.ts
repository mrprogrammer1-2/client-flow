"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { onboardingTemplateSteps, onboardingTemplates } from "@/db/schema";
import { ensureUserAndAgency } from "@/lib/services/ensure-user";

const allowedStepTypes = ["text", "textarea", "file", "url"] as const;

export async function createTemplateStepAction(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const required = formData.get("required") === "on";

  if (!templateId || !title) {
    throw new Error("Template ID and step title are required.");
  }

  if (!allowedStepTypes.includes(type as (typeof allowedStepTypes)[number])) {
    throw new Error("Invalid step type.");
  }

  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) {
    throw new Error("You must be logged in.");
  }

  const user = await ensureUserAndAgency({
    id: kindeUser.id,
    email: kindeUser.email,
    given_name: kindeUser.given_name,
  });

  if (!user) {
    throw new Error("Could not find the current user.");
  }

  // Confirm this template belongs to the logged-in agency.
  const [template] = await db
    .select({ id: onboardingTemplates.id })
    .from(onboardingTemplates)
    .where(
      and(
        eq(onboardingTemplates.id, templateId),
        eq(onboardingTemplates.agencyId, user.agencyId),
      ),
    )
    .limit(1);

  if (!template) {
    throw new Error("Template was not found for this agency.");
  }

  // Assign the next available display position automatically.
  const [lastStep] = await db
    .select({
      maxPosition: max(onboardingTemplateSteps.position),
    })
    .from(onboardingTemplateSteps)
    .where(eq(onboardingTemplateSteps.templateId, templateId));

  const position = Number(lastStep?.maxPosition ?? 0) + 1;

  await db.insert(onboardingTemplateSteps).values({
    templateId,
    title,
    description: description || null,
    type: type as (typeof allowedStepTypes)[number],
    required,
    position,
  });

  revalidatePath(`/dashboard/templates/${templateId}`);
}
