"use client";

import { QuickStartChecklist } from "@/components/QuickStartChecklist";

type ConfigPanelProps = {
  folderId: string | null;
  showEditorLink?: boolean;
};

export function ConfigPanel({
  folderId,
  showEditorLink = true,
}: ConfigPanelProps) {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "Not configured";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "Not configured";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Save to Google Drive
        </h2>
        <p className="text-sm text-slate-500">
          Double-check your Google credentials and Drive target before uploading.
        </p>
      </header>

      <dl className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-800">
            {clientId}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            NEXT_PUBLIC_GOOGLE_API_KEY
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-800">
            {apiKey}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Target folder
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            {folderId ?? "No folder selected (Drive root)"}
          </dd>
        </div>
      </dl>

      <QuickStartChecklist showEditorLink={showEditorLink} />
    </div>
  );
}

