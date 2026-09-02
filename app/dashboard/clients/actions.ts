"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { ensureUserAndAgency } from "@/lib/services/ensure-user";

export async function createClientAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !companyName || !email) {
    throw new Error("Name, company name, and email are required.");
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

  await db.insert(clients).values({
    agencyId: user.agencyId,
    name,
    companyName,
    email,
    phone: phone || null,
  });

  revalidatePath("/dashboard/clients");
}
