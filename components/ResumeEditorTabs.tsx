"use client";

import { ChangeEvent, RefObject } from "react";
import { FormEditor } from "@/components/FormEditor";
import { ConfigPanel } from "@/components/ConfigPanel";
import { ResumePreview } from "@/components/ResumePreview";
import { type CvData as ResumeData } from "@/lib/cv";

type EditorTabProps = {
  resume: ResumeData;
  onChange: (value: ResumeData) => void;
  onLoadSample: () => void;
};

export function EditorTab({
  resume,
  onChange,
  onLoadSample,
}: EditorTabProps) {
  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onLoadSample}
          className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
        >
          Load sample resume
        </button>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <FormEditor value={resume} onChange={onChange} />
      </section>
    </>
  );
}

type PreviewTabProps = {
  resume: ResumeData;
  onDownloadPdf: () => void;
  previewRef: RefObject<HTMLDivElement | null>;
};

export function PreviewTab({
  resume,
  onDownloadPdf,
  previewRef,
}: PreviewTabProps) {
  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onDownloadPdf}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Download PDF
        </button>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <ResumePreview ref={previewRef} resume={resume} />
      </section>
    </>
  );
}

type ConfigTabProps = {
  fileName: string;
  onFileNameChange: (value: string) => void;
  onSaveJson: () => void;
  isSaving: boolean;
  onDownloadJson: () => void;
  onImportJson: (event: ChangeEvent<HTMLInputElement>) => void;
  folderId: string | null;
  onLoadFromDrive: () => void;
  isLoadingFromDrive: boolean;
  canLoadFromDrive: boolean;
};

export function ConfigTab({
  fileName,
  onFileNameChange,
  onSaveJson,
  isSaving,
  onDownloadJson,
  canLoadFromDrive,
  onLoadFromDrive,
  isLoadingFromDrive,
  onImportJson,
  folderId,
}: ConfigTabProps) {
  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              File name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(event) => onFileNameChange(event.target.value)}
              className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={onSaveJson}
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSaving ? "Saving…" : "Save to Drive"}
            </button>
            <button
              type="button"
              onClick={onLoadFromDrive}
              disabled={!canLoadFromDrive || isLoadingFromDrive}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              {isLoadingFromDrive ? "Loading…" : "Load from Drive"}
            </button>
            <button
              type="button"
              onClick={onDownloadJson}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Save to local
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
              Load from local
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={onImportJson}
              />
            </label>
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <ConfigPanel folderId={folderId} />
      </section>
    </>
  );
}
