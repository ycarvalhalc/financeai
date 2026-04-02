"use client";

import { useEffect, useId } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Se omitido, gera id para aria-labelledby */
  titleId?: string;
  children: React.ReactNode;
  size?: "md" | "lg";
};

export function Modal({ open, onClose, title, titleId: titleIdProp, children, size = "md" }: ModalProps) {
  const genId = useId();
  const titleId = titleIdProp ?? `${genId}-title`;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const maxW = size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={`modal-animate relative max-h-[90vh] w-full ${maxW} overflow-hidden rounded-2xl border border-[var(--border)] bg-elevated shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
          <h2 id={titleId} className="font-display text-xl text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground focus-ring"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
