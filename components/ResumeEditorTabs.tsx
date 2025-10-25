"use client";

import { ChangeEvent, RefObject } from "react";
import { FormEditor } from "@/components/FormEditor";
import { ConfigPanel } from "@/components/ConfigPanel";
import { ResumePreview } from "@/components/ResumePreview";
import { type CvData as ResumeData } from "@/lib/cv";
import { useTranslation } from "./providers/LanguageProvider";

type EditorTabProps = {
  resume: ResumeData;
  onChange: (value: ResumeData) => void;
};

export function EditorTab({
  resume,
  onChange,
}: EditorTabProps) {
  const { t } = useTranslation();

  return (
    <section className="card space-y-6 !p-4 md:!p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {t("resumeTabs.editorTitle")}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("resumeTabs.editorDescription")}
          </p>
        </div>
      </header>
      <FormEditor value={resume} onChange={onChange} />
    </section>
  );
}

type PreviewTabProps = {
  resume: ResumeData;
  onDownloadPdf: () => void | Promise<void>;
  previewRef: RefObject<HTMLDivElement | null>;
  isExporting: boolean;
};

export function PreviewTab({
  resume,
  onDownloadPdf,
  previewRef,
  isExporting,
}: PreviewTabProps) {
  const { t } = useTranslation();

  return (
    <section className="card space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {t("resumeTabs.previewTitle")}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("resumeTabs.previewDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isExporting}
          aria-busy={isExporting}
          className="btn bg-[var(--color-primary)] border-transparent text-[var(--color-text-inverse)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        >
          {isExporting ? `${t("resumeTabs.exportPdf")}…` : t("resumeTabs.exportPdf")}
        </button>
      </header>
      <ResumePreview ref={previewRef} resume={resume} />
    </section>
  );
}

type ConfigTabProps = {
  fileName: string;
  onFileNameChange: (value: string) => void;
  onSaveJson: () => void;
  isSaving: boolean;
  onDownloadJson: () => void;
  onImportJson: (event: ChangeEvent<HTMLInputElement>) => void;
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
}: ConfigTabProps) {
  const { t } = useTranslation();

  return (
    <>
      <section className="card space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("resumeTabs.configFileName")}
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(event) => onFileNameChange(event.target.value)}
              className="input max-w-xs"
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={onSaveJson}
              disabled={isSaving}
              className="btn bg-[var(--color-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {isSaving ? t("resumeTabs.syncingToDrive") : t("resumeTabs.syncToDrive")}
            </button>
            <button
              type="button"
              onClick={onLoadFromDrive}
              disabled={!canLoadFromDrive || isLoadingFromDrive}
              className="btn border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-60"
            >
              {isLoadingFromDrive ? t("resumeTabs.loadingFromDrive") : t("resumeTabs.loadFromDrive")}
            </button>
            <button
              type="button"
              onClick={onDownloadJson}
              className="btn border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            >
              {t("resumeTabs.saveToLocal")}
            </button>
            <label className="btn border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer">
              {t("resumeTabs.loadFromLocal")}
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
      <section className="card">
        <ConfigPanel />
      </section>
    </>
  );
}
