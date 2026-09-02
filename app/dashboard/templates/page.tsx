import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { onboardingTemplates } from "@/db/schema";
import { ensureUserAndAgency } from "@/lib/services/ensure-user";

import { createTemplateAction } from "./actions";
import Link from "next/link";

export default async function TemplatesPage() {
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

  const templates = await db
    .select()
    .from(onboardingTemplates)
    .where(eq(onboardingTemplates.agencyId, user.agencyId))
    .orderBy(desc(onboardingTemplates.createdAt));

  return (
    <main className="mx-auto max-w-4xl space-y-10 p-8">
      <div>
        <h1 className="text-3xl font-bold">Onboarding templates</h1>
        <p className="mt-2 text-gray-600">
          Create reusable checklists for new client projects.
        </p>
      </div>

      <section className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Create a template</h2>

        <form action={createTemplateAction} className="mt-6 space-y-4">
          <input
            name="name"
            required
            placeholder="e.g. Website Client Onboarding"
            className="w-full rounded border p-3"
          />

          <textarea
            name="description"
            placeholder="What information should this template collect?"
            className="min-h-28 w-full rounded border p-3"
          />

          <button
            type="submit"
            className="rounded bg-black px-4 py-3 text-white"
          >
            Create template
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Your templates</h2>

        {templates.length === 0 ? (
          <p className="mt-4 text-gray-600">
            You haven&apos;t created any templates yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {templates.map((template) => (
              <article key={template.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{template.name}</h3>

                {template.description ? (
                  <p className="mt-1 text-sm text-gray-600">
                    {template.description}
                  </p>
                ) : null}

                <Link
                  href={`/dashboard/templates/${template.id}`}
                  className="mt-4 inline-block rounded bg-black px-3 py-2 text-sm text-white"
                >
                  Manage steps
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
