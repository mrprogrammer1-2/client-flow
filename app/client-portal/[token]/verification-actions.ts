"use server";

import { sendClientPortalVerification } from "@/lib/services/send-client-portal-verification";

export async function requestClientPortalVerificationAction(
  formData: FormData,
) {
  const token = String(formData.get("token") ?? "").trim();

  if (!token || token.length > 200) {
    return { success: false, error: "Invalid portal link." };
  }

  try {
    await sendClientPortalVerification(token);
    return {
      success: true,
      message: "If the request was valid, a verification email has been sent.",
    };
  } catch (error) {
    // Don't expose internal errors or project information to the browser.
    console.error("Client portal verification request failed:", error);

    return {
      success: false,
      error: "Could not send a verification code. Please try again later.",
    };
  }
}
