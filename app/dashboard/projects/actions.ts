"use server";

import { createProjectWithOnboarding } from "@/lib/services/create-project-with-onboarding";
import { requireAgencyAdmin } from "@/lib/services/check-agency-admin";
import { redirect } from "next/navigation";
import { completeOnboardingStep } from "@/lib/services/complete-onboarding-step";

export async function createProjectAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!clientId || !templateId || !name) {
    throw new Error("Client, template, and project name are required.");
  }

  const user = await requireAgencyAdmin();

  await createProjectWithOnboarding({
    agencyId: user.agencyId,
    clientId,
    templateId,
    name,
    description: description || undefined,
  });

  redirect("/dashboard/projects");
}

export async function markStepCompleteAction(formData: FormData) {
  const stepId = String(formData.get("stepId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  if (!stepId || !projectId) {
    throw new Error("Step ID and project ID are required.");
  }

  const user = await requireAgencyAdmin();

  await completeOnboardingStep({
    stepId,
    agencyId: user.agencyId,
  });

  redirect(`/dashboard/projects/${projectId}`);
}
