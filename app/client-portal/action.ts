"use server";

import { submitClientResponse } from "@/lib/services/submit-client-response";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requestClientPortalVerification, verifyClientPortalCode } from "@/lib/services/client-portal-verification";

export async function submitClientResponseAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const stepId = String(formData.get("stepId") ?? "");

  const answers: {
    questionId: string;
    answer: string;
  }[] = [];

  for (const [name, value] of formData.entries()) {
    if (name.startsWith("question_")) {
      const questionId = name.replace("question_", "");
      const answer = String(value);

      answers.push({
        questionId,
        answer,
      });
    }
  }

  const valueEntry = formData.get("value");
  const fileEntry = formData.get("file");

  const value = typeof valueEntry === "string" ? valueEntry : undefined;
  const file = fileEntry instanceof File ? fileEntry : undefined;

  if (!token || !stepId) {
    throw new Error("Missing required fields.");
  }

  await submitClientResponse({
    token,
    stepId,
    value,
    file,
    answers,
  });

  revalidatePath(`/client-portal/${token}`);
}


export async function requestPortalVerificationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!token) throw new Error("Missing portal token.");

  try {
    await requestClientPortalVerification(token);
  } catch {
    redirect(`/client-portal/${token}?error=email`);
  }
  redirect(`/client-portal/${token}?sent=1`);
}

export async function verifyPortalCodeAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  if (!token || !/^\d{6}$/.test(code)) {
    redirect(`/client-portal/${token}?error=code`);
  }

  const verified = await verifyClientPortalCode(token, code);
  if (!verified) {
    redirect(`/client-portal/${token}?error=code`);
  }

  redirect(`/client-portal/${token}`);
}
