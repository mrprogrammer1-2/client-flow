import { requireCurrentUser } from "@/lib/services/current-user";
import getAgencyInvitations from "@/lib/services/get-agency-invitations";
import InviteForm from "./invite-form";
import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { revokeInvitationAction } from "./action";
import ConfirmActionModal from "@/components/confirm-action-modal";

function formatTimeUntilExpiry(expiresAt: Date) {
  const remainingMs = expiresAt.getTime() - Date.now();

  if (remainingMs <= 0) {
    return "Expired";
  }

  const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
  if (remainingHours < 24) {
    return remainingHours === 1 ? "1 hour" : `${remainingHours} hours`;
  }

  const remainingDays = Math.ceil(remainingHours / 24);
  return remainingDays === 1 ? "1 day" : `${remainingDays} days`;
}

export default async function InvitationsPage() {
  const user = await requireCurrentUser();

  const canSeeInvitations = user.role === "admin" || user.role === "owner";
  const invitations = canSeeInvitations
    ? await getAgencyInvitations(user.agencyId)
    : [];
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl flex flex-col gap-4">
        <Link
          href="/dashboard/users"
          className="text-blue-600 hover:text-blue-800"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} />
            Back to Team Members
          </span>
        </Link>
        {canSeeInvitations && (
          <section
            aria-labelledby="team-invitation-heading"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="team-invitation-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Invitations
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600">
                {invitations.length}
              </span>
            </div>

            {invitations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-150 text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-3 font-medium">
                        Email
                      </th>

                      <th scope="col" className="px-3 py-3 font-medium">
                        Invited by
                      </th>

                      <th scope="col" className="px-3 py-3 font-medium">
                        Created at
                      </th>

                      <th scope="col" className="px-3 py-3 font-medium">
                        Expires in
                      </th>

                      <th scope="col" className="px-3 py-3 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {invitation.email}
                        </td>

                        <td className="px-3 py-3 text-slate-600">
                          {invitation.invitedByEmail}
                        </td>

                        <td className="px-3 py-3 text-slate-500">
                          {invitation.createdAt.toLocaleDateString()}
                        </td>

                        <td className="px-3 py-3 text-slate-500">
                          {formatTimeUntilExpiry(invitation.expiresAt)}
                        </td>

                        <td className="px-3 py-3">
                          <ConfirmActionModal
                            action={revokeInvitationAction}
                            confirmLabel="Revoke invitation"
                            description={`Are you sure you want to revoke the invitation for ${invitation.email}? This action cannot be undone.`}
                            fieldName="invitationId"
                            itemId={invitation.id}
                            title="Revoke invitation"
                            triggerLabel="Revoke invitation"
                            trigger={<UserX aria-hidden="true" size={16} />}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No invitations to display.
              </p>
            )}
          </section>
        )}

        <section
          aria-label="Invite a team member"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <InviteForm />
        </section>
      </div>
    </div>
  );
}
