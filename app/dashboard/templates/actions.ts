"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { onboardingTemplates } from "@/db/schema";
import { ensureUserAndAgency } from "@/lib/services/ensure-user";

export async function createTemplateAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    throw new Error("Template name is required.");
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

  await db.insert(onboardingTemplates).values({
    agencyId: user.agencyId,
    name,
    description: description || null,
  });

  revalidatePath("/dashboard/templates");
}
