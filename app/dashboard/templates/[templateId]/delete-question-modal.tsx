"use client";

import { Button } from "@/components/ui/button";
import { deleteTemplateQuestionAction } from "./actions";
import { useState } from "react";

type DeleteQuestionProps = {
  questionId: string;
};

export default function DeleteQuestionModal({
  questionId,
}: DeleteQuestionProps) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await deleteTemplateQuestionAction(formData);
    setIsOpen(false);
  }

  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>Delete</Button>
      {isOpen && (
        <form
          action={handleSubmit}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <input type="hidden" name="questionId" value={questionId} />
          <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Delete question</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this question?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" type="submit">
                Delete
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
