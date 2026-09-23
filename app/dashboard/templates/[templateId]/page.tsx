import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db";
import {
  onboardingTemplateQuestions,
  onboardingTemplateSteps,
  onboardingTemplates,
} from "@/db/schema";
import { ensureUserAndAgency } from "@/lib/services/ensure-user";
import {
  createTemplateQuestionAction,
  createTemplateStepAction,
} from "./actions";
import EditStepModal from "./edit-step-modal";
import DeleteStepModal from "./delete-step-modal";
import DeleteQuestionModal from "./delete-question-modal";
import EditQuestionModal from "./edit-question-modal";
import ReorderQuestionButtons from "./QuestionReorderButtons";

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

  const questions = await db
    .select()
    .from(onboardingTemplateQuestions)
    .where(
      inArray(
        onboardingTemplateQuestions.stepId,
        steps.map((step) => step.id),
      ),
    )
    .orderBy(asc(onboardingTemplateQuestions.position));

  return (
    <main className="mx-auto max-w-4xl space-y-10 p-8">
      <Link
        href="/dashboard/templates"
        className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        ← Back to templates
      </Link>

      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
        {template.description ? (
          <p className="mt-2 text-gray-500">{template.description}</p>
        ) : null}
      </div>

      <section className="rounded-xl border bg-gray-50 p-6">
        <h2 className="text-lg font-semibold">Add a step</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add one piece of information or a file you need from a client.
        </p>

        <form action={createTemplateStepAction} className="mt-5 space-y-4">
          <input type="hidden" name="templateId" value={template.id} />

          <input
            name="title"
            required
            placeholder="e.g. Upload your logo"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />

          <textarea
            name="description"
            placeholder="Optional instructions for the client"
            className="min-h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />

          <select
            name="type"
            required
            defaultValue="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="text">Short text</option>
            <option value="textarea">Long text</option>
            <option value="file">File upload</option>
            <option value="url">Website link</option>
            <option value="questionnaire">Questionnaire</option>
          </select>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              name="required"
              type="checkbox"
              className="rounded border-gray-300"
            />
            This step is required
          </label>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            Add step
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Template steps</h2>

        {steps.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            No steps yet. Add your first step above.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {steps.map((step) => {
              const stepQuestions = questions.filter(
                (question) => question.stepId === step.id,
              );
              return (
                <li
                  key={step.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {step.position}. {step.title}
                      </p>
                      {step.description ? (
                        <p className="mt-1 text-sm text-gray-500">
                          {step.description}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">
                          {step.type}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            step.required
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {step.required ? "Required" : "Optional"}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <EditStepModal step={step} />
                      <DeleteStepModal stepId={step.id} />
                    </div>
                  </div>

                  {step.type === "questionnaire" ? (
                    <section className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Questions
                      </h3>
                      {stepQuestions.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-400">
                          No questions yet.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {stepQuestions.map((question) => (
                            <li
                              key={question.id}
                              className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-sm"
                            >
                              <span className="text-gray-700">
                                {question.position}. {question.question}
                              </span>
                              <div className="flex shrink-0 items-center gap-1">
                                <EditQuestionModal
                                  questionId={question.id}
                                  question={question.question}
                                />
                                <DeleteQuestionModal questionId={question.id} />
                                <ReorderQuestionButtons
                                  questionId={question.id}
                                  position={question.position}
                                  totalQuestions={stepQuestions.length}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <form
                        action={createTemplateQuestionAction}
                        className="mt-3 flex gap-2"
                      >
                        <input type="hidden" name="stepId" value={step.id} />
                        <input
                          name="question"
                          required
                          placeholder="Add a question..."
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                        >
                          Add
                        </button>
                      </form>
                    </section>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
