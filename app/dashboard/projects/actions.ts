"use server";

import { createProjectWithOnboarding } from "@/lib/services/create-project-with-onboarding";
import { requireAgencyAdmin } from "@/lib/services/check-agency-admin";
import { redirect } from "next/navigation";
import { completeOnboardingStep } from "@/lib/services/complete-onboarding-step";
import { completeProject } from "@/lib/services/complete-project";
import { archiveProject } from "@/lib/services/archive-project";
import { restoreProject } from "@/lib/services/restore-project";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { and, eq, exists } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type CreateProjectState = {
  projectId: string | null;
  onboardingId: string | null;
  portalUrl: string | null;
};

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
) {
  const clientId = String(formData.get("clientId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!clientId || !templateId || !name) {
    throw new Error("Client, template, and project name are required.");
  }

  const user = await requireAgencyAdmin();

  const result = await createProjectWithOnboarding({
    agencyId: user.agencyId,
    clientId,
    templateId,
    name,
    description: description || undefined,
  });

  return result;
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

export async function completeProjectAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const user = await requireAgencyAdmin();

  await completeProject({
    projectId,
    agencyId: user.agencyId,
  });

  redirect(`/dashboard/projects/${projectId}`);
}

export async function archiveProjectAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const user = await requireAgencyAdmin();

  await archiveProject({
    projectId,
    agencyId: user.agencyId,
  });

  redirect(`/dashboard/projects/archived`);
}

export async function restoreProjectAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const user = await requireAgencyAdmin();

  await restoreProject({
    projectId,
    agencyId: user.agencyId,
  });

  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteProjectAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const user = await requireAgencyAdmin();

  await db.delete(projects).where(
    and(
      eq(projects.id, projectId),
      exists(
        db
          .select({ id: clients.id })
          .from(clients)
          .where(
            and(
              eq(clients.id, projects.clientId),
              eq(clients.agencyId, user.agencyId),
            ),
          ),
      ),
    ),
  );

  revalidatePath("/dashboard/projects");
}
