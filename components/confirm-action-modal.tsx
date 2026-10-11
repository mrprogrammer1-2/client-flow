"use client";

import { useId, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmActionModalProps = {
  action: (formData: FormData) => Promise<void>;
  confirmLabel: string;
  description: string;
  fieldName: string;
  itemId: string;
  title: string;
  triggerLabel: string;
  trigger: ReactNode;
};

export default function ConfirmActionModal({
  action,
  confirmLabel,
  description,
  fieldName,
  itemId,
  title,
  triggerLabel,
  trigger,
}: ConfirmActionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const titleId = useId();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);

    try {
      await action(formData);
      setIsOpen(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={triggerLabel}
        onClick={() => setIsOpen(true)}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        {trigger}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="Close confirmation dialog"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle
                aria-hidden="true"
                className="h-6 w-6 text-red-600"
              />
            </div>

            <h2
              id={titleId}
              className="mb-1 text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
            <p className="mb-6 text-sm text-slate-500">{description}</p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <form action={handleSubmit}>
                <input type="hidden" name={fieldName} value={itemId} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? `${confirmLabel}...` : confirmLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
