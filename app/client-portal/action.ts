"use server";

import { submitClientResponse } from "@/lib/services/submit-client-response";
import { revalidatePath } from "next/cache";

export async function submitClientResponseAction(formData: FormData) {
  const token = formData.get("token") as string;
  const value = formData.get("value") as string;
  const stepId = formData.get("stepId") as string;

  if (!token || !value || !stepId) {
    throw new Error("Missing required fields");
  }

  await submitClientResponse({ token, value, stepId });

  revalidatePath(`/client-portal/${token}`);
}
