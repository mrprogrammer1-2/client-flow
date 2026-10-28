"use server";

import { verifyClientPortalCode } from "@/lib/services/verify-client-portal-code";

export async function verifyClientPortalCodeAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!token || token.length > 200) {
    return {
      success: false,
      error: "Invalid portal link.",
    };
  }

  if (!/^\d{6}$/.test(code)) {
    return {
      success: false,
      error: "Enter the six-digit verification code.",
    };
  }

  try {
    return await verifyClientPortalCode(token, code);
  } catch (error) {
    console.error("Client portal code verification failed:", error);

    return {
      success: false,
      error: "Verification failed. Please try again.",
    };
  }
}
