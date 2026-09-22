import { db } from "@/db";
import {
  clientPortalAccess,
  projectOnboardingQuestionResponses,
  projectOnboardings,
  projectOnboardingStepResponses,
  projectOnboardingSteps,
  projectOnboardingQuestions,
} from "@/db/schema";
import { createHash, randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { uploadToCloudinary } from "./upload-to-cloudinary";

type SubmitClientResponseInput = {
  token: string;
  stepId: string;
  value?: string;
  file?: File;
  answers?: {
    questionId: string;
    answer: string;
  }[];
};

export async function submitClientResponse({
  token,
  value,
  stepId,
  file,
  answers,
}: SubmitClientResponseInput) {
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [portalAccess] = await db
    .select()
    .from(clientPortalAccess)
    .where(eq(clientPortalAccess.tokenHash, tokenHash))
    .limit(1);

  if (!portalAccess) {
    throw new Error("Invalid token");
  }

  if (portalAccess.revokedAt) {
    throw new Error("Token has been revoked");
  }

  if (portalAccess.expiresAt && portalAccess.expiresAt < new Date()) {
    throw new Error("Token has expired");
  }

  const [step] = await db
    .select({
      id: projectOnboardingSteps.id,
      status: projectOnboardingSteps.status,
      projectOnboardingId: projectOnboardingSteps.projectOnboardingId,
      type: projectOnboardingSteps.type,
    })
    .from(projectOnboardingSteps)
    .where(
      and(
        eq(projectOnboardingSteps.id, stepId),
        eq(
          projectOnboardingSteps.projectOnboardingId,
          portalAccess.projectOnboardingId,
        ),
      ),
    )
    .limit(1);

  if (!step) {
    throw new Error("Invalid step");
  }

  if (step.status === "completed") {
    throw new Error("Step has already been completed");
  }

  let cleanValue: string | undefined;

  if (value) {
    cleanValue = value.trim();
  }

  if (step.type === "file") {
    if (!file) {
      throw new Error("File is required.");
    }
  } else if (step.type === "questionnaire") {
    if (!answers || answers.length === 0) {
      throw new Error("At least one answer is required.");
    }
  } else {
    if (!cleanValue) {
      throw new Error("Response is required.");
    }
  }

  let uploadedFile: { url: string; publicId: string } | undefined;

  if (step.type === "file" && file) {
    uploadedFile = await uploadToCloudinary(file);
  }

  return await db.transaction(async (tx) => {
    const [currentStep] = await tx
      .select({
        id: projectOnboardingSteps.id,
        status: projectOnboardingSteps.status,
      })
      .from(projectOnboardingSteps)
      .where(eq(projectOnboardingSteps.id, step.id))
      .limit(1);

    if (!currentStep) {
      throw new Error("Step not found.");
    }

    if (currentStep.status === "completed") {
      throw new Error("Step has already been completed.");
    }

    if (step.type === "questionnaire" && answers) {
      const questions = await tx
        .select({
          id: projectOnboardingQuestions.id,
        })
        .from(projectOnboardingQuestions)
        .where(eq(projectOnboardingQuestions.projectOnboardingStepId, step.id));

      const answeredQuestionIds = answers.map((answer) => answer.questionId);

      const allQuestionsAnswered = questions.every((question) =>
        answeredQuestionIds.includes(question.id),
      );

      if (!allQuestionsAnswered) {
        throw new Error("All questions must be answered.");
      }
      for (const answer of answers) {
        const questionExists = questions.some(
          (question) => question.id === answer.questionId,
        );

        if (!questionExists) {
          throw new Error("Invalid question.");
        }
        await tx
          .insert(projectOnboardingQuestionResponses)
          .values({
            questionId: answer.questionId,
            answer: answer.answer,
          })
          .onConflictDoUpdate({
            target: projectOnboardingQuestionResponses.questionId,
            set: {
              answer: answer.answer,
            },
          });
      }
    } else {
      await tx.insert(projectOnboardingStepResponses).values({
        id: randomUUID(),
        projectOnboardingStepId: step.id,
        value: cleanValue,
        fileUrl: uploadedFile?.url ?? null,
        fileName: file?.name ?? null,
      });
    }

    await tx
      .update(projectOnboardingSteps)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(projectOnboardingSteps.id, step.id));

    const allSteps = await tx
      .select({
        status: projectOnboardingSteps.status,
      })
      .from(projectOnboardingSteps)
      .where(
        eq(
          projectOnboardingSteps.projectOnboardingId,
          step.projectOnboardingId,
        ),
      );

    const allCompleted = allSteps.every((s) => s.status === "completed");

    const someCompleted = allSteps.some((s) => s.status === "completed");

    const onboardingStatus = allCompleted
      ? "completed"
      : someCompleted
        ? "in_progress"
        : "not_started";

    // 9. Update onboarding status
    await tx
      .update(projectOnboardings)
      .set({
        status: onboardingStatus,
        updatedAt: new Date(),
      })
      .where(eq(projectOnboardings.id, step.projectOnboardingId));
  });
}
