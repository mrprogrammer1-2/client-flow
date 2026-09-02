import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db";
import { onboardingTemplateSteps, onboardingTemplates } from "@/db/schema";
import { ensureUserAndAgency } from "@/lib/services/ensure-user";

import { createTemplateStepAction } from "./actions";

type TemplateDetailsPageProps = {
  params: Promise<{
    templateId: string;
  }>;
};

export default async function TemplateDetailsPage({
  params,
}: TemplateDetailsPageProps) {
  const { templateId } = await params;

  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) {
    redirect("/");
  }

  const user = await ensureUserAndAgency({
    id: kindeUser.id,
    email: kindeUser.email,
    given_name: kindeUser.given_name,
  });

  if (!user) {
    throw new Error("Could not find the current user.");
  }

  const [template] = await db
    .select()
    .from(onboardingTemplates)
    .where(
      and(
        eq(onboardingTemplates.id, templateId),
        eq(onboardingTemplates.agencyId, user.agencyId),
      ),
    )
    .limit(1);

  if (!template) {
    notFound();
  }

  const steps = await db
    .select()
    .from(onboardingTemplateSteps)
    .where(eq(onboardingTemplateSteps.templateId, template.id))
    .orderBy(asc(onboardingTemplateSteps.position));

  return (
    <main className="mx-auto max-w-4xl space-y-10 p-8">
      <Link
        href="/dashboard/templates"
        className="text-sm text-gray-600 underline"
      >
        ← Back to templates
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{template.name}</h1>

        {template.description ? (
          <p className="mt-2 text-gray-600">{template.description}</p>
        ) : null}
      </div>

      <section className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Add a step</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add one piece of information or a file you need from a client.
        </p>

        <form action={createTemplateStepAction} className="mt-6 space-y-4">
          <input type="hidden" name="templateId" value={template.id} />

          <input
            name="title"
            required
            placeholder="e.g. Upload your logo"
            className="w-full rounded border p-3"
          />

          <textarea
            name="description"
            placeholder="Optional instructions for the client"
            className="min-h-28 w-full rounded border p-3"
          />

          <select
            name="type"
            required
            defaultValue="text"
            className="w-full rounded border p-3"
          >
            <option value="text">Short text</option>
            <option value="textarea">Long text</option>
            <option value="file">File upload</option>
            <option value="url">Website link</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input name="required" type="checkbox" />
            This step is required
          </label>

          <button
            type="submit"
            className="rounded bg-black px-4 py-3 text-white"
          >
            Add step
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Template steps</h2>

        {steps.length === 0 ? (
          <p className="mt-4 text-gray-600">This template has no steps yet.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {steps.map((step) => (
              <li key={step.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {step.position}. {step.title}
                    </p>

                    {step.description ? (
                      <p className="mt-1 text-sm text-gray-600">
                        {step.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-right text-sm text-gray-600">
                    <p>{step.type}</p>
                    <p>{step.required ? "Required" : "Optional"}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
