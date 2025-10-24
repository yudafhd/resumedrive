"use client";

import { XIcon } from "lucide-react";
import { useEffect } from "react";

export type ToastVariant = "info" | "success" | "error";

export type ToastMessage = {
  id: number;
  message: string;
  variant?: ToastVariant;
};

type ToastProps = ToastMessage & {
  onDismiss?: () => void;
};

const variantClasses: Record<ToastVariant, string> = {
  info: "bg-[var(--color-info)] text-[var(--color-text-inverse)]",
  success: "bg-[var(--color-success)] text-[var(--color-text-inverse)]",
  error: "bg-[var(--color-error)] text-[var(--color-text-inverse)]",
};

export function Toast({ message, variant = "info", onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss?.(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto z-[var(--z-toast)] flex items-center justify-end gap-3 rounded-[var(--radius-xl)] px-4 py-2 shadow-lg ${variantClasses[variant]}`}
      aria-live="polite"
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="btn !p-1 text-xs font-semibold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
      >
        <XIcon className="w-3" />
      </button>
    </div>
  );
}
