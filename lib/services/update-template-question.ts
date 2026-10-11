import { db } from "@/db";
import {
  onboardingTemplateQuestions,
  onboardingTemplates,
  onboardingTemplateSteps,
} from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

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
        stepId: onboardingTemplateQuestions.stepId,
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

    if (!selectedQuestion) {
      throw new Error("Question not found");
    }

    const [updatedQuestion] = await tx
      .update(onboardingTemplateQuestions)
      .set({
        question,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(onboardingTemplateQuestions.id, questionId),
          eq(onboardingTemplateQuestions.stepId, selectedQuestion.stepId),
        ),
      )
      .returning({
        id: onboardingTemplateQuestions.id,
        question: onboardingTemplateQuestions.question,
      });

    if (!updatedQuestion) {
      throw new Error("Question could not be updated.");
    }

    return {
      ...updatedQuestion,
      templateId: selectedQuestion.templateId,
    };
  });
}
