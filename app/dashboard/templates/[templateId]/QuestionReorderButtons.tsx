"use client";

import { Button } from "@/components/ui/button";
import { reorderTemplateQuestionAction } from "./actions";

type ReorderQuestionButtonsProps = {
  questionId: string;
  position: number;
  totalQuestions: number;
};

export default function ReorderQuestionButtons({
  questionId,
  position,
  totalQuestions,
}: ReorderQuestionButtonsProps) {
  const canMoveUp = position > 1;
  const canMoveDown = position < totalQuestions;

  return (
    <div className="flex items-center gap-1">
      <form action={reorderTemplateQuestionAction}>
        <input type="hidden" name="questionId" value={questionId} />
        <input type="hidden" name="newPosition" value={position - 1} />

        <Button type="submit" variant="outline" size="sm" disabled={!canMoveUp}>
          ↑
        </Button>
      </form>

      <form action={reorderTemplateQuestionAction}>
        <input type="hidden" name="questionId" value={questionId} />
        <input type="hidden" name="newPosition" value={position + 1} />

        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!canMoveDown}
        >
          ↓
        </Button>
      </form>
    </div>
  );
}
