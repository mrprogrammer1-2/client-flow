import { db } from "@/db";
import {
  onboardingTemplateQuestions,
  onboardingTemplates,
  onboardingTemplateSteps,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

type UpdateQuestionProps = {
  question: string;
  questionId: string;
  agencyId: string;
};

export async function updateTemplateQuestion({
  question,
  questionId,
  agencyId,
}: UpdateQuestionProps) {
  return await db.transaction(async (tx) => {
    const [selectedQuestion] = await tx
      .select({
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
      throw new Error("Question not found");
    }

    const [updatedQuestion] = await tx
      .update(onboardingTemplateQuestions)
      .set({
        question,
        updatedAt: new Date(),
      })
      .where(eq(onboardingTemplateQuestions.id, questionId))
      .returning({
        id: onboardingTemplateQuestions.id,
        question: onboardingTemplateQuestions.question,
      });

    return {
      ...updatedQuestion,
      templateId: selectedQuestion.templateId,
    };
  });
}
