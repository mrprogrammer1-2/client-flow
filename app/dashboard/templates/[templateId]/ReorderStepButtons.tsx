"use client";

import { Button } from "@/components/ui/button";
import { reorderTemplateStepAction } from "./actions";

type ReorderStepButtonsProps = {
  stepId: string;
  position: number;
  totalSteps: number;
};

export default function ReorderStepButtons({
  stepId,
  position,
  totalSteps,
}: ReorderStepButtonsProps) {
  const canMoveUp = position > 1;
  const canMoveDown = position < totalSteps;

  return (
    <div className="flex items-center gap-1">
      <form action={reorderTemplateStepAction}>
        <input type="hidden" name="stepId" value={stepId} />
        <input type="hidden" name="newPosition" value={position - 1} />

        <Button type="submit" variant="outline" size="sm" disabled={!canMoveUp}>
          ↑
        </Button>
      </form>

      <form action={reorderTemplateStepAction}>
        <input type="hidden" name="stepId" value={stepId} />
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
