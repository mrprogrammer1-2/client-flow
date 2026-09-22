"use client";

import { Trash2 } from "lucide-react";
import { deleteProjectAction } from "./actions";

export default function DeleteProjectButton({
  projectId,
}: {
  projectId: string;
}) {
  return (
    <form
      action={deleteProjectAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this project permanently?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        aria-label="Delete project"
        title="Delete project"
        className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
      >
        <Trash2 size={17} aria-hidden="true" />
      </button>
    </form>
  );
}
