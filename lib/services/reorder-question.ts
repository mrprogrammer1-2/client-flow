import { db } from "@/db";
import {
  onboardingTemplateQuestions,
  onboardingTemplateSteps,
  onboardingTemplates,
} from "@/db/schema";
import { and, eq, gt, lt, sql } from "drizzle-orm";

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
    // 1. Find the question and verify ownership
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
        ),
      )
      .limit(1);

    if (!question) {
      throw new Error("Question not found.");
    }

    const { stepId, position: oldPosition, templateId } = question;

    // 2. Don't do anything if position didn't change
    if (oldPosition === newPosition) {
      return { templateId };
    }

    // 3. Find how many questions exist in this step
    const questions = await tx
      .select({
        id: onboardingTemplateQuestions.id,
        position: onboardingTemplateQuestions.position,
      })
      .from(onboardingTemplateQuestions)
      .where(eq(onboardingTemplateQuestions.stepId, stepId));

    // 4. Validate the requested position
    if (newPosition < 1 || newPosition > questions.length) {
      throw new Error("Invalid position.");
    }

    // 5. Temporarily move the question out of the way
    await tx
      .update(onboardingTemplateQuestions)
      .set({ position: -1 })
      .where(eq(onboardingTemplateQuestions.id, questionId));

    const TEMP_OFFSET = 1000000;

    // 6. Temporarily move affected questions
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

    // 7. Give affected questions their new positions
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

    // 8. Put the moved question into its final position
    await tx
      .update(onboardingTemplateQuestions)
      .set({ position: newPosition })
      .where(eq(onboardingTemplateQuestions.id, questionId));

    return { templateId };
  });
}
