"use client";

import { Button } from "@/components/ui/button";
import { updateTemplateQuestionAction } from "./actions";
import { useState } from "react";

type EditQuestionProps = {
  questionId: string;
  question: string;
};

export default function EditQuestionModal({
  questionId,
  question,
}: EditQuestionProps) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await updateTemplateQuestionAction(formData);
    setIsOpen(false);
  }

  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>Edit</Button>
      {isOpen && (
        <form
          action={handleSubmit}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <input type="hidden" name="questionId" value={questionId} />
          <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Edit question</h3>
            <div className="mt-4">
              <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                Question
              </label>
              <input
                type="text"
                name="question"
                id="question"
                defaultValue={question}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
