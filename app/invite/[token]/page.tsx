import getInvitationByToken from "@/lib/services/get-invitation-by-token";
import validateInvitation from "@/lib/services/validate-invitation";
import { notFound } from "next/navigation";
import { acceptInvitationAction } from "./accept-invitation";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InviteTokenPage({ params }: Props) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  const validatedInvitation = await validateInvitation(invitation);

  const isValid = validatedInvitation.valid;
  const reason = validatedInvitation.reason;

  return (
    <div>
      {!isValid && reason === "already accepted" && (
        <div>
          <p>This invitation has already been accepted.</p>
        </div>
      )}

      {isValid && reason === "valid" && (
        <div>
          <p>This invitation is valid.</p>
          <form action={acceptInvitationAction}>
            <input type="hidden" name="token" value={token} />
            <Button type="submit">Accept Invitation</Button>
          </form>
        </div>
      )}

      {!isValid && reason === "expired" && (
        <div>
          <p>This invitation has expired.</p>
        </div>
      )}

      {!isValid && reason === "revoked" && (
        <div>
          <p>This invitation has been revoked.</p>
        </div>
      )}
    </div>
  );
}
