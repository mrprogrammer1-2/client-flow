"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";
import { requireAgencyAdmin } from "@/lib/services/check-agency-admin";
import { redirect } from "next/navigation";
import archiveClient from "@/lib/services/archive-client";

export async function createClientAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !companyName || !email) {
    throw new Error("Name, company name, and email are required.");
  }

  const user = await requireCurrentUser();

  await db.insert(clients).values({
    agencyId: user.agencyId,
    name,
    companyName,
    email,
    phone: phone || null,
  });

  revalidatePath("/dashboard/clients");
}

export async function archiveClientAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");

  if (!clientId) {
    throw new Error("Client ID is required.");
  }

  const user = await requireAgencyAdmin();

  const result = await archiveClient({
    clientId,
    agencyId: user.agencyId,
  });

  if (!result) {
    throw new Error("Failed to archive client.");
  }

  redirect(`/dashboard/clients/archived`);
}
