"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateTemplateStepAction } from "./actions";

type EditStepModalProps = {
  step: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    required: boolean;
  };
};

export default function EditStepModal({ step }: EditStepModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await updateTemplateStepAction(formData);
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
          <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Edit step</h3>
            <p className="mt-1 text-sm text-gray-500">Update the details of this step.</p>

            <input type="hidden" name="stepId" value={step.id} />

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  defaultValue={step.title}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={step.description || ""}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <p className="text-sm text-gray-500">
                Type: <span className="font-medium capitalize text-gray-700">{step.type}</span>
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  id="required"
                  name="required"
                  defaultChecked={step.required}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Required
              </label>
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
