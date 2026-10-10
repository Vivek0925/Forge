"use client";

import React, { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="
          relative z-10 flex h-[100dvh] w-full min-w-0 flex-col
          overflow-hidden bg-white shadow-2xl
          sm:h-[min(780px,calc(100dvh-48px))]
          sm:w-[min(1160px,calc(100vw-48px))]
          sm:rounded-2xl
        "
      >
        {title && (
          <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6">
            <h2
              id="modal-title"
              className="text-base font-semibold text-slate-900 sm:text-lg"
            >
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-hidden p-0">
          {children}
        </div>
      </div>
    </div>
  );
}