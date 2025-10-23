"use client";

import { ReactNode } from "react";

type QuickStartChecklistProps = {
  className?: string;
  title?: string;
  description?: ReactNode;
  showEditorLink?: boolean;
};

const baseClasses =
  "space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-6 text-sm text-blue-900";

export function QuickStartChecklist({
  className,
  title = "Quick start checklist",
  description,
}: QuickStartChecklistProps) {
  return (
    <aside className={`${baseClasses} ${className ?? ""}`.trim()}>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <div className="text-xs text-blue-800">{description}</div>}
      <ul className="space-y-2">
        <li>1. Configure Google OAuth Client ID with Drive API enabled.</li>
        <li>2. Add API Key for Google Picker in `.env.local`.</li>
        <li>
          3. Sign in, choose a folder, and create a JSON draft or import a JSON resume.
        </li>
        <li>4. Use the editor to edit and save JSON.</li>
      </ul>
    </aside>
  );
}
