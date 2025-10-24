"use client";

import type { DriveFile } from "@/lib/drive-server";
import { Trash2Icon } from "lucide-react";
import { useTranslation } from "./providers/LanguageProvider";

type FileListProps = {
  files: DriveFile[];
  isLoading?: boolean;
  onSelect: (file: DriveFile) => void;
  onDelete?: (file: DriveFile) => void;
  title?: string;
};

export function FileList({
  files,
  isLoading,
  onSelect,
  onDelete,
}: FileListProps) {
  const { t, language } = useTranslation();

  const visibleFiles = (files ?? []).filter((file) => {
    const name = (file.name ?? "").toString();
    const mime = (file.mimeType ?? "").toString();
    if (/\.xlsx$/i.test(name)) return false;
    if (mime.toLowerCase().includes("spreadsheet")) return false;
    return mime === "application/json";
  });

  if (isLoading) {
    return (
      <div className="card text-center text-sm text-[var(--color-text-muted)]">
        {t("fileList.loading")}
      </div>
    );
  }

  if (!visibleFiles.length) {
    return (
      <div className="card border-dashed text-center text-sm text-[var(--color-text-muted)]">
        {t("fileList.empty")}
      </div>
    );
  }

  return (
    <>
      {visibleFiles.map((file) => {
        const formattedDate =
          file.modifiedTime && language
            ? new Date(file.modifiedTime).toLocaleDateString(language, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null;
        return (
          <section
            key={file.id}
            className="card group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3 shadow-[0px_20px_40px_-24px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/60 backdrop-blur-sm hover:shadow-[0px_24px_48px_-24px_rgba(15,23,42,0.5)] hover:ring-blue-200"
          >
            <button
              type="button"
              onClick={() => onSelect(file)}
              className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)] rounded-[var(--radius-lg)]"
            >
              <p className="text-sm !mb-2 font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                {file.name}
              </p>
              {formattedDate && (
                <span className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {t("fileList.updatedAt", { date: formattedDate })}
                </span>
              )}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(file)}
                className="p-2"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            )}
          </section>
        );
      })}
    </>
  );
}

