"use client";

import { useState } from "react";
import { requestClientPortalVerificationAction } from "./verification-actions";
import { verifyClientPortalCodeAction } from "./verify-code-action";

type Props = {
  token: string;
};

export default function ClientPortalVerificationForm({ token }: Props) {
  const [codeRequested, setCodeRequested] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleRequestCode(formData: FormData) {
    setMessage("");
    setError("");
    setIsPending(true);

    try {
      const result = await requestClientPortalVerificationAction(formData);

      if (result.success) {
        setCodeRequested(true);
        setMessage(
          result.message ?? "Check your email for the verification code.",
        );
      } else {
        setError(result.error ?? "Could not request a code.");
      }
    } catch {
      setError("Could not request a code. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleVerifyCode(formData: FormData) {
    setMessage("");
    setError("");
    setIsPending(true);

    try {
      const result = await verifyClientPortalCodeAction(formData);

      if (result.success) {
        // Refresh the Server Component so it can read the new session cookie.
        window.location.reload();
      } else {
        setError(result.error ?? "Verification failed.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-500">Client Portal</p>
        <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-600">
          Request a verification code sent to the email address associated with
          your project.
        </p>

        {message && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {!codeRequested ? (
          <form action={handleRequestCode} className="mt-6">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {isPending ? "Sending..." : "Email me a verification code"}
            </button>
          </form>
        ) : (
          <form action={handleVerifyCode} className="mt-6">
            <input type="hidden" name="token" value={token} />

            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Six-digit verification code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-gray-400"
              placeholder="000000"
            />

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {isPending ? "Verifying..." : "Verify and continue"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
