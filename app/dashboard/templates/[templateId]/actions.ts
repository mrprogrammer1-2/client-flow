"use server";

import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  onboardingTemplateQuestions,
  onboardingTemplateSteps,
  onboardingTemplates,
} from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";
import { requireAgencyAdmin } from "@/lib/services/check-agency-admin";
import { updateTemplateStep } from "@/lib/services/update-template-step";
import { deleteTemplateStep } from "@/lib/services/delete-template-step";
import { deleteTemplateQuestion } from "@/lib/services/delete-template-question";
import { updateTemplateQuestion } from "@/lib/services/update-template-question";
import { reorderTemplateQuestion } from "@/lib/services/reorder-question";
import { reorderTemplateStep } from "@/lib/services/reorder-template-step";

const allowedStepTypes = [
  "text",
  "textarea",
  "file",
  "url",
  "questionnaire",
] as const;

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

  const user = await requireCurrentUser();

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

export async function createTemplateQuestionAction(formData: FormData) {
  const stepId = String(formData.get("stepId") ?? "");
  const question = String(formData.get("question") ?? "").trim();

  if (!stepId || !question) {
    throw new Error("Step ID and question are required.");
  }

  const user = await requireCurrentUser();

  const [step] = await db
    .select({
      id: onboardingTemplateSteps.id,
      stepType: onboardingTemplateSteps.type,
      templateId: onboardingTemplateSteps.templateId,
    })
    .from(onboardingTemplateSteps)
    .innerJoin(
      onboardingTemplates,
      eq(onboardingTemplates.id, onboardingTemplateSteps.templateId),
    )
    .where(
      and(
        eq(onboardingTemplateSteps.id, stepId),
        eq(onboardingTemplates.agencyId, user.agencyId),
      ),
    )
    .limit(1);

  if (!step) {
    throw new Error("Step was not found for this agency.");
  }

  if (step.stepType !== "questionnaire") {
    throw new Error("This step type does not support questions.");
  }

  const [lastQuestion] = await db
    .select({
      maxPosition: max(onboardingTemplateQuestions.position),
    })
    .from(onboardingTemplateQuestions)
    .where(eq(onboardingTemplateQuestions.stepId, stepId));

  const position = Number(lastQuestion?.maxPosition ?? 0) + 1;

  await db.insert(onboardingTemplateQuestions).values({
    stepId,
    question,
    position,
  });

  revalidatePath(`/dashboard/templates/${step.templateId}`);
}

export async function updateTemplateStepAction(formData: FormData) {
  const stepId = String(formData.get("stepId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const required = formData.get("required") === "on";

  if (!stepId || !title) {
    throw new Error("Missing required fields.");
  }

  const user = await requireAgencyAdmin();

  const result = await updateTemplateStep({
    stepId,
    agencyId: user.agencyId,
    title,
    description,
    required,
  });

  revalidatePath(`/dashboard/templates/${result.templateId}`);
}

export async function deleteTemplateStepAction(formData: FormData) {
  const stepId = String(formData.get("stepId") ?? "");

  if (!stepId) {
    throw new Error("Missing required fields.");
  }

  const user = await requireAgencyAdmin();

  const result = await deleteTemplateStep({
    stepId,
    agencyId: user.agencyId,
  });

  revalidatePath(`/dashboard/templates/${result.templateId}`);
}

export async function deleteTemplateQuestionAction(formData: FormData) {
  const questionId = String(formData.get("questionId") ?? "");

  if (!questionId) {
    throw new Error("Missing required fields.");
  }

  const user = await requireAgencyAdmin();

  const result = await deleteTemplateQuestion({
    questionId,
    agencyId: user.agencyId,
  });

  revalidatePath(`/dashboard/templates/${result.templateId}`);
}

export async function updateTemplateQuestionAction(formData: FormData) {
  const questionId = String(formData.get("questionId") ?? "");
  const question = String(formData.get("question") ?? "").trim();

  if (!question || !questionId) {
    throw new Error("Missing required fields.");
  }

  const user = await requireAgencyAdmin();

  const result = await updateTemplateQuestion({
    questionId,
    agencyId: user.agencyId,
    question,
  });

  revalidatePath(`/dashboard/templates/${result.templateId}`);
}

export async function reorderTemplateQuestionAction(formData: FormData) {
  const questionId = String(formData.get("questionId") ?? "");
  const newPosition = Number(formData.get("newPosition"));

  if (!questionId || !Number.isInteger(newPosition)) {
    throw new Error("Invalid input.");
  }

  const user = await requireAgencyAdmin();

  const result = await reorderTemplateQuestion({
    questionId,
    newPosition,
    agencyId: user.agencyId,
  });

  revalidatePath(`/dashboard/templates/${result.templateId}`);
}

export async function reorderTemplateStepAction(formData: FormData) {
  const stepId = String(formData.get("stepId") ?? "");
  const newPosition = Number(formData.get("newPosition"));

  if (!stepId || !Number.isInteger(newPosition)) {
    throw new Error("Invalid input.");
  }

  const user = await requireAgencyAdmin();

  const result = await reorderTemplateStep({
    stepId,
    newPosition,
    agencyId: user.agencyId,
  });

  revalidatePath(`/dashboard/templates/${result.templateId}`);
}
