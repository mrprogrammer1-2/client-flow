import { requireCurrentUser } from "@/lib/services/current-user";
import getAgencyUsers from "@/lib/services/get-agency-users";
import canManageUser from "@/lib/services/can-manage-user";
import { removeUserAction, updateUserRoleAction } from "./action";
import Link from "next/link";
import { ArrowRight, Trash } from "lucide-react";
import ConfirmActionModal from "@/components/confirm-action-modal";

// function formatTimeUntilExpiry(expiresAt: Date) {
//   const remainingMs = expiresAt.getTime() - Date.now();

//   if (remainingMs <= 0) {
//     return "Expired";
//   }

//   const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
//   if (remainingHours < 24) {
//     return remainingHours === 1 ? "1 hour" : `${remainingHours} hours`;
//   }

//   const remainingDays = Math.ceil(remainingHours / 24);
//   return remainingDays === 1 ? "1 day" : `${remainingDays} days`;
// }

export default async function UsersPage() {
  const user = await requireCurrentUser();
  const teamMembers = await getAgencyUsers(user.agencyId);

  // const canSeeInvitations = user.role === "admin" || user.role === "owner";
  // const invitations = canSeeInvitations
  //   ? await getAgencyInvitations(user.agencyId)
  //   : [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
              Team
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Team Members
            </h1>
          </div>

          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
            Manage access and invites
          </div>
        </div>

        <div className="space-y-6">
          <section
            aria-labelledby="team-members-heading"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="team-members-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Members
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600">
                {teamMembers.length}
              </span>
            </div>

            {teamMembers.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {teamMembers.map((member) => {
                  const canManage =
                    user.id !== member.id &&
                    canManageUser({
                      currentRole: user.role,
                      targetRole: member.role,
                    });
                  return (
                    <li
                      key={member.id}
                      className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-slate-900">
                        {member.email}
                      </span>
                      <div className="flex gap-4">
                        <span className="text-slate-500">
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </span>
                        <span className="text-slate-500">
                          {member.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      {canManage && (
                        <>
                          <form
                            action={updateUserRoleAction}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="hidden"
                              name="userId"
                              value={member.id}
                            />

                            <select
                              key={`${member.id}-${member.role}`}
                              name="newRole"
                              defaultValue={member.role}
                              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              type="submit"
                              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                            >
                              Update
                            </button>
                          </form>
                          <ConfirmActionModal
                            action={removeUserAction}
                            confirmLabel="Remove member"
                            description={`Are you sure you want to remove ${member.email}? This action cannot be undone.`}
                            fieldName="userId"
                            itemId={member.id}
                            title="Remove team member"
                            triggerLabel="Remove team member"
                            trigger={<Trash aria-hidden="true" size={16} />}
                          />
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No team members yet. Send an invitation to add someone.
              </p>
            )}
          </section>

          {/* {canSeeInvitations && (
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
          </section> */}
          <Link
            href="/dashboard/invitations"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Manage Invitations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
