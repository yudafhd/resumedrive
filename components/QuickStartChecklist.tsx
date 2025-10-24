"use client";

import { ReactNode } from "react";
import { useTranslation } from "./providers/LanguageProvider";

type QuickStartChecklistProps = {
  className?: string;
  title?: string;
  description?: ReactNode;
  showEditorLink?: boolean;
};

const baseClasses =
  "space-y-4 rounded-2xl border border-white/70 bg-white/80 p-6 text-sm text-[var(--color-text-primary)] shadow-[0px_16px_30px_-28px_rgba(15,23,42,0.3)] backdrop-blur";

export function QuickStartChecklist({
  className,
  title,
  description,
}: QuickStartChecklistProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("quickStart.title");

  return (
    <aside className={`${baseClasses} ${className ?? ""}`.trim()}>
      <h2 className="text-base font-semibold">{resolvedTitle}</h2>
      {description && (
        <div className="text-xs text-[var(--color-text-secondary)]">
          {description}
        </div>
      )}
      <ul className="space-y-2">
        <li>{t("quickStart.step1")}</li>
        <li>{t("quickStart.step2")}</li>
        <li>{t("quickStart.step3")}</li>
        <li>{t("quickStart.step4")}</li>
      </ul>
    </aside>
  );
}
