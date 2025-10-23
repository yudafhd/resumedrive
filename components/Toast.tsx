"use client";

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
  info: "bg-slate-900 text-white",
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
};

export function Toast({ message, variant = "info", onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss?.(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-center justify-end gap-3 rounded-xl px-4 py-2 shadow-lg ${variantClasses[variant]}`}
      aria-live="polite"
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-full border border-white/40 px-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
      >
        close
      </button>
    </div>
  );
}
