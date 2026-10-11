"use server";

import { requireAgencyAdmin } from "@/lib/services/check-agency-admin";
import createInvitation from "@/lib/services/create-invitation";
import revokeInvitation from "@/lib/services/revoke-invitation";
import { revalidatePath } from "next/cache";

export type InviteUserState = {
  token: string | null;
  error: string | null;
};

export async function inviteUserAction(
  _previousState: InviteUserState,
  formData: FormData,
) {
  try {
    const user = await requireAgencyAdmin();
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      return {
        token: null,
        error: "Email is required.",
      };
    }

    const result = await createInvitation({
      email,
      invitedBy: user.id,
      agencyId: user.agencyId,
    });

    return {
      token: result.token,
      error: null,
    };
  } catch (error) {
    return {
      token: null,
      error: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
}

export async function revokeInvitationAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "").trim();
  if (!invitationId) {
    throw new Error("Invitation ID is required.");
  }

  const user = await requireAgencyAdmin();

  await revokeInvitation({
    invitationId,
    agencyId: user.agencyId,
  });

  revalidatePath("/dashboard/invitations");
}
