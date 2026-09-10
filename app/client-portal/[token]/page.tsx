import { submitClientResponseAction } from "../action";
import { getClientPortal } from "@/lib/services/get-client-portal";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ClientPortalPage({ params }: Props) {
  const { token } = await params;

  const portal = await getClientPortal(token);

  if (!portal) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Project information */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Client Portal
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {portal.project.name}
          </h1>

          <p className="mt-2 text-gray-600">{portal.project.description}</p>

          <p className="mt-4 text-sm text-gray-500">
            Client:{" "}
            <span className="font-medium text-gray-700">
              {portal.project.clientName}
            </span>
          </p>
        </section>

        {/* Progress */}
        <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Onboarding Progress</h2>

            <span className="text-sm font-medium text-gray-600">
              {portal.onboarding.progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-900 transition-all"
              style={{
                width: `${portal.onboarding.progress}%`,
              }}
            />
          </div>
        </section>

        {/* Onboarding steps */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Your onboarding
          </h2>

          <div className="space-y-3">
            {portal.onboarding.steps.map((step) => {
              const isCompleted = step.status === "completed";

              return (
                <div
                  key={step.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  {/* Step header */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        isCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isCompleted ? "✓" : step.position}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {step.title}
                      </h3>

                      {step.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {step.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>

                  {/* Response area */}
                  <form action={submitClientResponseAction} className="mt-5">
                    {!isCompleted && step.type === "textarea" && (
                      <textarea
                        name="value"
                        rows={5}
                        placeholder="Tell us about your company..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                      />
                    )}

                    {!isCompleted && step.type === "file" && (
                      <input
                        type="file"
                        name="file"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                      />
                    )}

                    {!isCompleted && step.type === "url" && (
                      <input
                        type="url"
                        name="value"
                        placeholder="Enter URL.b.."
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                      />
                    )}

                    {!isCompleted && step.type === "text" && (
                      <input
                        type="text"
                        name="value"
                        placeholder="Enter your response..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                      />
                    )}

                    {!isCompleted && (
                      <>
                        <input type="hidden" name="stepId" value={step.id} />

                        <input type="hidden" name="token" value={token} />

                        <button
                          type="submit"
                          className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                          Submit response
                        </button>
                      </>
                    )}
                  </form>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
