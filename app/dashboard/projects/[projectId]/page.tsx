import { db } from "@/db/index";
import {
  clients,
  projectOnboardings,
  projectOnboardingStepResponses,
  projectOnboardingSteps,
  projectOnboardingQuestions,
  projectOnboardingQuestionResponses,
  projects,
} from "@/db/schema";
import { requireCurrentUser } from "@/lib/services/current-user";
import {
  markStepCompleteAction,
  completeProjectAction,
  archiveProjectAction,
} from "@/app/dashboard/projects/actions";
import { eq, and, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireCurrentUser();

  const projectData = await db
    .select({
      projectName: projects.name,
      projectDescription: projects.description,
      projectStatus: projects.status,
      clientName: clients.name,
      onboardingStatus: projectOnboardings.status,
      stepId: projectOnboardingSteps.id,
      stepTitle: projectOnboardingSteps.title,
      stepStatus: projectOnboardingSteps.status,
      stepPosition: projectOnboardingSteps.position,
      responseValue: projectOnboardingStepResponses.value,
      responseFileUrl: projectOnboardingStepResponses.fileUrl,
      responseFileName: projectOnboardingStepResponses.fileName,
      questionId: projectOnboardingQuestions.id,
      questionText: projectOnboardingQuestions.question,
      answer: projectOnboardingQuestionResponses.answer,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .innerJoin(
      projectOnboardings,
      eq(projectOnboardings.projectId, projects.id),
    )
    .innerJoin(
      projectOnboardingSteps,
      eq(projectOnboardingSteps.projectOnboardingId, projectOnboardings.id),
    )
    .leftJoin(
      projectOnboardingStepResponses,
      eq(
        projectOnboardingStepResponses.projectOnboardingStepId,
        projectOnboardingSteps.id,
      ),
    )
    .leftJoin(
      projectOnboardingQuestions,
      eq(
        projectOnboardingQuestions.projectOnboardingStepId,
        projectOnboardingSteps.id,
      ),
    )
    .leftJoin(
      projectOnboardingQuestionResponses,
      eq(
        projectOnboardingQuestionResponses.questionId,
        projectOnboardingQuestions.id,
      ),
    )
    .where(and(eq(projects.id, projectId), eq(clients.agencyId, user.agencyId)))
    .orderBy(
      asc(projectOnboardingSteps.position),
      asc(projectOnboardingQuestions.position),
    );

  // return notfound if the length === 0
  if (projectData.length === 0) {
    return notFound();
  }

  // project
  const project = projectData[0];

  // steps
  const steps = projectData.reduce<
    {
      id: string;
      title: string;
      status: string;
      position: number;
      response: {
        value: string | null;
        fileUrl: string | null;
        fileName: string | null;
      };
      questions: {
        id: string;
        question: string;
        answer: string | null;
      }[];
    }[]
  >((steps, row) => {
    const existingStep = steps.find((step) => step.id === row.stepId);

    if (!existingStep) {
      steps.push({
        id: row.stepId,
        title: row.stepTitle,
        status: row.stepStatus,
        position: row.stepPosition,
        response: {
          value: row.responseValue,
          fileUrl: row.responseFileUrl,
          fileName: row.responseFileName,
        },
        questions: row.questionId
          ? [
              {
                id: row.questionId,
                question: row.questionText!,
                answer: row.answer,
              },
            ]
          : [],
      });
    } else if (row.questionId) {
      existingStep.questions.push({
        id: row.questionId,
        question: row.questionText!,
        answer: row.answer,
      });
    }

    return steps;
  }, []);

  // calculating progress
  const totalSteps = steps.length;
  const completedSteps = steps.filter(
    (step) => step.status === "completed",
  ).length;

  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="max-w-4xl mx-auto bg-gray-200 w-full p-4 mt-4 rounded-2xl">
      <div className="flex justify-between items-center w-full">
        <div className=" space-x-2 flex">
          {project.projectStatus !== "archived" && (
            <form action={archiveProjectAction}>
              <input type="hidden" name="projectId" value={projectId} />

              <button
                type="submit"
                className="rounded bg-green-600 px-4 py-2 text-white cursor-pointer"
              >
                archive Project
              </button>
            </form>
          )}
          {project.projectStatus === "active" ? (
            <form action={completeProjectAction}>
              <input type="hidden" name="projectId" value={projectId} />

              <button
                type="submit"
                className="rounded bg-green-600 px-4 py-2 text-white cursor-pointer"
              >
                Complete Project
              </button>
            </form>
          ) : (
            <div />
          )}
        </div>
        <p
          className={`px-3 py-2 rounded ${
            project.projectStatus === "completed"
              ? "bg-green-300"
              : "bg-gray-300"
          }`}
        >
          {project.projectStatus}
        </p>
      </div>
      <div className="flex flex-col gap-4 ">
        <h1>{project.projectName}</h1>
        <p>{project.projectDescription}</p>
        <p>Client: {project.clientName}</p>
        <p>Onboarding: {project.onboardingStatus}</p>
        <div className="mb-4">
          <p>Progress: {progress}%</p>
          <div className="w-full bg-gray-100 h-4">
            <div
              className="bg-green-400 rounded h-4"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>
      <h2>Onboarding Steps</h2>

      <div className="flex flex-col gap-4 mt-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`${step.status === "completed" ? "bg-green-100" : "bg-gray-100"} p-2`}
          >
            <h3>{step.title}</h3>
            <p>Status: {step.status}</p>
            {(step.response.value || step.response.fileUrl) && (
              <div>
                <p>Response:</p>

                {step.response.value && <p>{step.response.value}</p>}

                {step.response.fileUrl && (
                  <a
                    href={step.response.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {step.response.fileName || "View file"}
                  </a>
                )}
              </div>
            )}

            {step.questions.length > 0 && (
              <div className="mt-4 border-l-2 border-gray-300 pl-4">
                <p className="font-medium">Questionnaire:</p>

                <div className="mt-2 space-y-3">
                  {step.questions.map((question) => (
                    <div key={question.id}>
                      <p className="font-medium">{question.question}</p>
                      <p className="text-gray-600">
                        {question.answer || "No answer"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step.status !== "completed" && (
              <form action={markStepCompleteAction}>
                <input type="hidden" name="stepId" value={step.id} />
                <input type="hidden" name="projectId" value={projectId} />

                <Button type="submit">Mark as complete</Button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
