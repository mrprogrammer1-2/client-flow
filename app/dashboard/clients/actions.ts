"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";

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
