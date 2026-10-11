import { ArrowRight, BriefcaseBusiness, Sparkles, Users } from "lucide-react";
import { requireCurrentUser } from "@/lib/services/current-user";

export default async function DashboardPage() {
  const appUser = await requireCurrentUser();
  const name = appUser.kindeUser?.given_name ?? "there";

  return (
    <main className="app-shell py-8 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900 sm:text-4xl">
            Hello, {name}
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <Sparkles className="size-4" />
          Role: {appUser.role}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          { label: "Active projects", value: "12", icon: BriefcaseBusiness },
          { label: "Clients onboarded", value: "9", icon: Users },
          { label: "Launch readiness", value: "94%", icon: ArrowRight },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-panel soft-ring p-5">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(52,211,153,0.14))] text-indigo-600">
              <Icon className="size-5" />
            </div>
            <p className="text-3xl font-black tracking-[-0.05em] text-slate-900">{value}</p>
            <p className="mt-2 text-sm text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      <section className="glass-panel soft-ring mt-8 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">This week</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-900">Momentum is looking strong</h2>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">On track</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Client intake", "Kickoff prep", "Review cycle"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{item}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">0{index + 1}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div
                  className="h-2.5 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))]"
                  style={{ width: `${72 + index * 9}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
