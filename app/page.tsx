import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: FolderKanban,
    title: "Project clarity",
    description: "Keep every engagement organized, visible, and moving with calm momentum.",
  },
  {
    icon: Users,
    title: "Client-friendly flow",
    description: "Invite collaborators, track onboarding, and keep communication effortless.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence built in",
    description: "Approve milestones, monitor progress, and reduce operational friction.",
  },
];

const metrics = [
  { label: "Projects launched", value: "240+" },
  { label: "Onboarding saved", value: "12h" },
  { label: "Client satisfaction", value: "98%" },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="app-shell relative py-8 sm:py-10">
        <header className="glass-panel soft-ring mb-8 flex items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-lg font-bold text-white shadow-lg shadow-indigo-200/70">
              C
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">ClientFlow</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#workflow" className="hover:text-slate-900">Workflow</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-4 text-sm font-medium text-white shadow-[0_12px_30px_rgba(108,122,255,0.25)] transition hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="grid gap-8 pb-8 pt-2 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="size-4" />
              Built for joyful client operations
            </div>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-6xl">
                Turn client work into a smoother, brighter routine.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                ClientFlow brings onboarding, project tracking, and everyday collaboration into one optimistic workspace designed to make progress feel effortless.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-5 text-base font-medium text-white shadow-[0_16px_32px_rgba(108,122,255,0.28)] transition hover:-translate-y-0.5"
              >
                Start free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white/70 px-5 text-base font-medium text-slate-700 shadow-sm transition hover:bg-white"
              >
                See how it works
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              {[
                "No-code onboarding",
                "Smart project visibility",
                "Built for modern teams",
              ].map((item) => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="hero-grid glass-panel soft-ring relative overflow-hidden p-4 sm:p-6">
            <div className="absolute inset-x-8 top-8 h-32 rounded-full bg-[radial-gradient(circle,_rgba(111,125,255,0.3),_transparent_60%)] blur-2xl" />
            <div className="relative rounded-[26px] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-2xl shadow-indigo-500/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Quarterly plan</p>
                  <h2 className="mt-2 text-2xl font-semibold">Client operations</h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
                  +24.8%
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ["Onboarding", "92%", "bg-gradient-to-r from-cyan-400 to-emerald-400"],
                  ["Project health", "84%", "bg-gradient-to-r from-indigo-400 to-violet-400"],
                  ["Client sentiment", "96%", "bg-gradient-to-r from-pink-400 to-orange-300"],
                ].map(([label, value, bar]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                      <span>{label}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${bar}`} style={{ width: value }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Next milestone</p>
                  <p className="mt-1 text-sm font-medium text-white">New website launch</p>
                </div>
                <div className="rounded-xl bg-white/8 p-2 text-indigo-100">
                  <Zap className="size-5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Why teams love it</p>
            <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-900 sm:text-4xl">
              Everything your client process needs, without the chaos.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="glass-panel soft-ring p-6 text-left">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(75,99,255,0.15),rgba(87,204,180,0.18))] text-indigo-600">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
                <p className="text-base leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="py-12">
          <div className="glass-panel soft-ring flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="max-w-xl">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Workflow</p>
              <h3 className="text-3xl font-black tracking-[-0.05em] text-slate-900">See momentum at every stage.</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map(({ label, value }) => (
                <div key={label} className="stat-card min-w-[150px]">
                  <p className="text-2xl font-black tracking-[-0.05em] text-slate-900">{value}</p>
                  <p className="mt-2 text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer id="pricing" className="py-12 pb-20 text-center text-slate-500">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700">
            <Sparkles className="size-4 text-indigo-500" />
            Designed to feel calm, clear, and optimistic.
          </div>
        </footer>
      </div>
    </main>
  );
}
