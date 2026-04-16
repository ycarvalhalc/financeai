"use client";

import { Modal } from "@/components/ui/Modal";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger = excluir / ação destrutiva; neutral = apenas confirmação */
  variant?: "danger" | "neutral";
  onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <p className="text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-background focus-ring"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={async () => {
            await Promise.resolve(onConfirm());
            onClose();
          }}
          className={
            variant === "danger"
              ? "rounded-xl bg-danger/90 px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-danger focus-ring"
              : "rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-accent-dim focus-ring"
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
