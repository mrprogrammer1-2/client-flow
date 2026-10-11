"use client";

import { useActionState, useState } from "react";
import { inviteUserAction, type InviteUserState } from "./action";

const initialState: InviteUserState = {
  token: null,
  error: null,
};

export default function InviteForm() {
  const [state, formAction, isPending] = useActionState(
    inviteUserAction,
    initialState,
  );
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Invite a team member
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Send an email invite to grant access to your agency workspace.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="member@example.com"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isPending ? "Creating..." : "Create Invitation"}
        </button>
      </form>

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state.token && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            Invitation created.
          </p>

          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Token
              </p>
              <div className="flex items-center gap-2">
                <code className="block flex-1 break-all rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800">
                  {state.token}
                </code>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Invite link
              </p>
              <code className="block break-all rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800">
                {`${appUrl}/invite/${state.token}`}
              </code>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    state.token ? `${appUrl}/invite/${state.token}` : "",
                  );
                  setCopied(true);
                }}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
