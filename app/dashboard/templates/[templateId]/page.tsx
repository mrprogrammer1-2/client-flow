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
  archiveTemplateAction,
  createTemplateQuestionAction,
  createTemplateStepAction,
  restoreTemplateAction,
} from "./actions";
import EditStepModal from "./edit-step-modal";
import DeleteStepModal from "./delete-step-modal";
import DeleteQuestionModal from "./delete-question-modal";
import EditQuestionModal from "./edit-question-modal";
import ReorderQuestionButtons from "./QuestionReorderButtons";
import ReorderStepButtons from "./ReorderStepButtons";
import { Button } from "@/components/ui/button";

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

  const questions =
    steps.length === 0
      ? []
      : await db
          .select()
          .from(onboardingTemplateQuestions)
          .where(
            inArray(
              onboardingTemplateQuestions.stepId,
              steps.map((step) => step.id),
            ),
          )
          .orderBy(asc(onboardingTemplateQuestions.position));

  const isArchived = template.status === "archived";
  const statusClasses = {
    active: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    inactive: "border border-slate-200 bg-slate-100 text-slate-700",
    archived: "border border-red-200 bg-red-50 text-red-700",
  } as const;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          Back to templates
        </Link>

        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-6 text-white md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                  Template
                </span>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {template.name}
                </h1>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium capitalize ${statusClasses[template.status]}`}
              >
                {template.status}
              </span>
            </div>

            {template.description ? (
              <p className="mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
                {template.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 md:px-8">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {steps.length} step{steps.length === 1 ? "" : "s"}
            </div>

            <div className="flex items-center gap-3">
              {!isArchived && (
                <form action={archiveTemplateAction}>
                  <input type="hidden" name="templateId" value={template.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  >
                    Archive
                  </Button>
                </form>
              )}

              {isArchived && (
                <form action={restoreTemplateAction}>
                  <input type="hidden" name="templateId" value={template.id} />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Restore
                  </Button>
                </form>
              )}
            </div>
          </div>
        </header>

        {!isArchived ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                  Create
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Add a step
                </h2>
              </div>

              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                Required notice
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              Add one piece of information or a file you need from a client.
            </p>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              At least one step must be marked as required for the template to be
              active.
            </div>

            <form action={createTemplateStepAction} className="mt-6 grid gap-4">
              <input type="hidden" name="templateId" value={template.id} />

              <div className="grid gap-2">
                <label
                  htmlFor="template-step-title"
                  className="text-sm font-medium text-slate-700"
                >
                  Step title
                </label>
                <input
                  id="template-step-title"
                  name="title"
                  required
                  placeholder="e.g. Upload your logo"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-3 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="template-step-description"
                  className="text-sm font-medium text-slate-700"
                >
                  Instructions
                </label>
                <textarea
                  id="template-step-description"
                  name="description"
                  placeholder="Optional instructions for the client"
                  className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-3 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="template-step-type"
                  className="text-sm font-medium text-slate-700"
                >
                  Step type
                </label>
                <select
                  id="template-step-type"
                  name="type"
                  required
                  defaultValue="text"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-3 focus:ring-indigo-100"
                >
                  <option value="text">Short text</option>
                  <option value="textarea">Long text</option>
                  <option value="file">File upload</option>
                  <option value="url">Website link</option>
                  <option value="questionnaire">Questionnaire</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    name="required"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  This step is required
                </label>

                <Button
                  type="submit"
                  className="bg-slate-900 text-white hover:bg-slate-700"
                >
                  Add step
                </Button>
              </div>
            </form>
          </section>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-600">
            This template is read-only while archived.
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                Structure
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                Template steps
              </h2>
            </div>
          </div>

          {steps.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              {isArchived
                ? "This template has no steps."
                : "No steps yet. Add your first step above."}
            </div>
          ) : (
            <ol className="mt-6 space-y-4">
              {steps.map((step) => {
                const stepQuestions = questions.filter(
                  (question) => question.stepId === step.id,
                );

                return (
                  <li
                    key={step.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                            {step.position}
                          </span>
                          <p className="text-lg font-semibold text-slate-900">
                            {step.title}
                          </p>
                        </div>

                        {step.description ? (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {step.description}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-100">
                            {step.type}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              step.required
                                ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {step.required ? "Required" : "Optional"}
                          </span>
                        </div>
                      </div>

                      {!isArchived && (
                        <div className="flex shrink-0 items-center gap-2">
                          <EditStepModal step={step} />

                          <DeleteStepModal stepId={step.id} />

                          <ReorderStepButtons
                            stepId={step.id}
                            position={step.position}
                            totalSteps={steps.length}
                          />
                        </div>
                      )}
                    </div>

                    {step.type === "questionnaire" ? (
                      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-700">
                            Questions
                          </h3>

                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {stepQuestions.length}
                          </span>
                        </div>

                        {stepQuestions.length === 0 ? (
                          <p className="mt-3 text-sm text-slate-400">
                            No questions yet.
                          </p>
                        ) : (
                          <ul className="mt-3 space-y-2">
                            {stepQuestions.map((question) => (
                              <li
                                key={question.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                              >
                                <span className="text-slate-700">
                                  {question.position}. {question.question}
                                </span>

                                {!isArchived && (
                                  <div className="flex shrink-0 items-center gap-1">
                                    <EditQuestionModal
                                      questionId={question.id}
                                      question={question.question}
                                    />

                                    <DeleteQuestionModal
                                      questionId={question.id}
                                    />

                                    <ReorderQuestionButtons
                                      questionId={question.id}
                                      position={question.position}
                                      totalQuestions={stepQuestions.length}
                                    />
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {!isArchived && (
                          <form
                            action={createTemplateQuestionAction}
                            className="mt-4 flex flex-col gap-2 sm:flex-row"
                          >
                            <input type="hidden" name="stepId" value={step.id} />

                            <input
                              name="question"
                              required
                              placeholder="Add a question..."
                              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-3 focus:ring-indigo-100"
                            />

                            <Button
                              type="submit"
                              className="bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                              Add
                            </Button>
                          </form>
                        )}
                      </section>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
