"use server";

import { submitClientResponse } from "@/lib/services/submit-client-response";
import { revalidatePath } from "next/cache";

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
