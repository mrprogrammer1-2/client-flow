"use server";

import acceptInvitation from "@/lib/services/accept-invitation";
import { getAuthenticatedKindeUser } from "@/lib/services/current-user";

import getInvitationByToken from "@/lib/services/get-invitation-by-token";
import validateInvitation from "@/lib/services/validate-invitation";
import { redirect } from "next/navigation";

export async function acceptInvitationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");

  if (!token) {
    throw new Error("Invitation token is required.");
  }

  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    throw new Error("Invalid invitation token.");
  }

  const validatedInvitation = await validateInvitation(invitation);

  if (!validatedInvitation.valid) {
    throw new Error("Invitation is not valid.");
  }

  const kindeUser = await getAuthenticatedKindeUser();

  if (!kindeUser.email) {
    throw new Error("Email is required.");
  }

  if (!kindeUser.id) {
    throw new Error("Kinde user ID is required.");
  }

  const kindeEmail = kindeUser.email.trim().toLowerCase();

  if (kindeEmail !== invitation.email) {
    throw new Error(
      "The email from Kinde does not match the email in the invitation.",
    );
  }

  await acceptInvitation({
    invitationId: invitation.id,
    kindeUserId: kindeUser.id,
    email: kindeEmail,
  });

  redirect("/dashboard");
}
