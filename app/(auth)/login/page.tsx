import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4 sm:p-6">
      <div className="glass-panel soft-ring w-full max-w-md overflow-hidden">
        <div className="bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(52,211,153,0.10))] p-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-xl font-black text-white shadow-lg shadow-indigo-200/70">
            C
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">ClientFlow</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep projects joyful, organized, and moving forward.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 px-3 py-2 text-sm text-indigo-700">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="size-4" />
              Everything in one calm workspace
            </div>
          </div>

          <div className="grid gap-3">
            <LoginLink className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-5 text-sm font-medium text-white shadow-[0_16px_32px_rgba(108,122,255,0.28)] transition hover:-translate-y-0.5">
              Sign in
              <ArrowRight className="size-4" />
            </LoginLink>
            <RegisterLink className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white/80 px-5 text-sm font-medium text-slate-700 transition hover:bg-white">
              Create account
            </RegisterLink>
          </div>
        </div>
      </div>
    </main>
  );
}
