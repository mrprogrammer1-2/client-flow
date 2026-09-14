"use client";

import { createProjectAction } from "./actions";
import type { CreateProjectState } from "./actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const initialState: CreateProjectState = {
  projectId: null,
  onboardingId: null,
  portalUrl: null,
};

type CreateProjectFormProps = {
  clients: {
    id: string;
    name: string;
  }[];
  templates: {
    id: string;
    name: string;
  }[];
};

export default function CreateProjectForm({
  clients,
  templates,
}: CreateProjectFormProps) {
  const [state, formAction] = useActionState(createProjectAction, initialState);
  const [copied, setCopied] = useState(false);

  const fieldClass = "border border-gray-200 p-2.5 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create Project</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to set up a new client project.</p>
        </div>

        <form
          action={formAction}
          className="flex flex-col gap-4 bg-white border border-gray-200 p-6 rounded-xl shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Project Name</label>
            <input name="name" placeholder="e.g. Website Redesign" required className={fieldClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" placeholder="Brief project overview..." rows={3} className={fieldClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Client</label>
            <select name="clientId" required className={fieldClass}>
              <option value="" disabled>Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Template</label>
            <select name="templateId" required className={fieldClass}>
              <option value="" disabled>Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          <Button type="submit" className="mt-2 cursor-pointer w-full">
            Create Project
          </Button>
        </form>

        {state.portalUrl && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-medium text-green-800 mb-2">✓ Project created successfully!</p>
            <div className="flex gap-2">
              <input
                value={state.portalUrl}
                readOnly
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 truncate"
              />
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(state.portalUrl!);
                  setCopied(true);
                }}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-700 whitespace-nowrap"
              >
                {copied ? "✓ Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
