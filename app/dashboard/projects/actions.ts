"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { ensureUserAndAgency } from "@/lib/services/ensure-user";
import { createProjectWithOnboarding } from "@/lib/services/create-project-with-onboarding";

export async function createProjectAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!clientId || !templateId || !name) {
    throw new Error("Client, template, and project name are required.");
  }

  // Get the authenticated Kinde user.
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) {
    throw new Error("You must be logged in.");
  }

  // Get/create their ClientFlow database record.
  const user = await ensureUserAndAgency({
    id: kindeUser.id,
    email: kindeUser.email,
    given_name: kindeUser.given_name,
  });

  if (!user) {
    throw new Error("Could not create or find the current user.");
  }

  // agencyId comes from the secure server-side user record,
  // never from the browser form.
  return createProjectWithOnboarding({
    agencyId: user.agencyId,
    clientId,
    templateId,
    name,
    description: description || undefined,
  });
}
