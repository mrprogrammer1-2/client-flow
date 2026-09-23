import { db } from "@/db";
import {
  onboardingTemplateQuestions,
  onboardingTemplates,
  onboardingTemplateSteps,
} from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

type DeleteQuestionProps = {
  questionId: string;
  agencyId: string;
};

export async function deleteTemplateQuestion({
  questionId,
  agencyId,
}: DeleteQuestionProps) {
  return await db.transaction(async (tx) => {
    const [selectedQuestion] = await tx
      .select({
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

    if (!selectedQuestion) {
      throw new Error("Question not found.");
    }

    await tx
      .delete(onboardingTemplateQuestions)
      .where(eq(onboardingTemplateQuestions.id, questionId));

    await tx
      .update(onboardingTemplateQuestions)
      .set({
        position: sql`${onboardingTemplateQuestions.position} - 1`,
      })
      .where(
        and(
          eq(onboardingTemplateQuestions.stepId, selectedQuestion.stepId),
          gt(onboardingTemplateQuestions.position, selectedQuestion.position),
        ),
      );

    return {
      templateId: selectedQuestion.templateId,
    };
  });
}
