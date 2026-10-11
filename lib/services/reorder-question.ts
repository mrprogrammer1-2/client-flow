import { db } from "@/db";
import {
  onboardingTemplateQuestions,
  onboardingTemplateSteps,
  onboardingTemplates,
} from "@/db/schema";
import { and, eq, gt, lt, ne, sql } from "drizzle-orm";

type ReorderQuestionInput = {
  questionId: string;
  newPosition: number;
  agencyId: string;
};

export async function reorderTemplateQuestion({
  questionId,
  newPosition,
  agencyId,
}: ReorderQuestionInput) {
  return await db.transaction(async (tx) => {
    const [question] = await tx
      .select({
        id: onboardingTemplateQuestions.id,
        stepId: onboardingTemplateQuestions.stepId,
        position: onboardingTemplateQuestions.position,
        templateId: onboardingTemplateSteps.templateId,
      })
      .from(onboardingTemplateQuestions)
      .innerJoin(
        onboardingTemplateSteps,
        eq(onboardingTemplateQuestions.stepId, onboardingTemplateSteps.id),
      )
      .innerJoin(
        onboardingTemplates,
        eq(onboardingTemplateSteps.templateId, onboardingTemplates.id),
      )
      .where(
        and(
          eq(onboardingTemplateQuestions.id, questionId),
          eq(onboardingTemplates.agencyId, agencyId),
          ne(onboardingTemplates.status, "archived"),
        ),
      )
      .limit(1);

    if (!question) {
      throw new Error("Question not found.");
    }

    const { stepId, position: oldPosition, templateId } = question;

    if (oldPosition === newPosition) {
      return { templateId };
    }

    const questions = await tx
      .select({
        id: onboardingTemplateQuestions.id,
        position: onboardingTemplateQuestions.position,
      })
      .from(onboardingTemplateQuestions)
      .where(eq(onboardingTemplateQuestions.stepId, stepId));

    if (newPosition < 1 || newPosition > questions.length) {
      throw new Error("Invalid position.");
    }

    const [movedQuestion] = await tx
      .update(onboardingTemplateQuestions)
      .set({ position: -1 })
      .where(
        and(
          eq(onboardingTemplateQuestions.id, questionId),
          eq(onboardingTemplateQuestions.stepId, stepId),
        ),
      )
      .returning({
        id: onboardingTemplateQuestions.id,
      });

    if (!movedQuestion) {
      throw new Error("Question could not be reordered.");
    }

    const TEMP_OFFSET = 1000000;

    await tx
      .update(onboardingTemplateQuestions)
      .set({
        position: sql`${onboardingTemplateQuestions.position} + ${TEMP_OFFSET}`,
      })
      .where(
        and(
          eq(onboardingTemplateQuestions.stepId, stepId),
          oldPosition < newPosition
            ? gt(onboardingTemplateQuestions.position, oldPosition)
            : gt(onboardingTemplateQuestions.position, newPosition - 1),
          oldPosition < newPosition
            ? lt(onboardingTemplateQuestions.position, newPosition + 1)
            : lt(onboardingTemplateQuestions.position, oldPosition),
        ),
      );

    await tx
      .update(onboardingTemplateQuestions)
      .set({
        position:
          oldPosition < newPosition
            ? sql`${onboardingTemplateQuestions.position} - ${TEMP_OFFSET + 1}`
            : sql`${onboardingTemplateQuestions.position} - ${TEMP_OFFSET - 1}`,
      })
      .where(
        and(
          eq(onboardingTemplateQuestions.stepId, stepId),
          gt(onboardingTemplateQuestions.position, TEMP_OFFSET),
        ),
      );

    const [updatedQuestion] = await tx
      .update(onboardingTemplateQuestions)
      .set({ position: newPosition })
      .where(
        and(
          eq(onboardingTemplateQuestions.id, questionId),
          eq(onboardingTemplateQuestions.stepId, stepId),
        ),
      )
      .returning({
        id: onboardingTemplateQuestions.id,
      });

    if (!updatedQuestion) {
      throw new Error("Question could not be reordered.");
    }

    return { templateId };
  });
}
