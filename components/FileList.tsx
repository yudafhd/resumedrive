"use client";

import type { DriveFile } from "@/lib/drive-server";

type FileListProps = {
  files: DriveFile[];
  isLoading?: boolean;
  onSelect: (file: DriveFile) => void;
  onRefresh?: () => void;
  onDelete?: (file: DriveFile) => void;
  title?: string;
};

export function FileList({
  files,
  isLoading,
  onSelect,
  onRefresh,
  onDelete,
  title,
}: FileListProps) {
  // Defensive client-side filter: only show JSON files and hide any spreadsheet/XLSX entries.
  const visibleFiles = (files ?? []).filter((file) => {
    const name = (file.name ?? "").toString();
    const mime = (file.mimeType ?? "").toString();
    if (/\.xlsx$/i.test(name)) return false;
    if (mime.toLowerCase().includes("spreadsheet")) return false;
    return mime === "application/json";
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
        Loading files from Google Drive…
      </div>
    );
  }

  if (!visibleFiles.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        No app files found. Create a file from the editor or upload one with the
        Google Picker.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-600">{title ?? "Drive files"}</h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {visibleFiles.map((file) => (
          <li key={file.id}>
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-400 hover:shadow">
              <button
                type="button"
                onClick={() => onSelect(file)}
                className="flex-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    {file.name}
                  </span>
                </div>
                {file.modifiedTime && (
                  <p className="mt-1 text-xs text-slate-500">
                    Updated {new Date(file.modifiedTime).toLocaleString()}
                  </p>
                )}
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(file)}
                  className="ml-3 text-xs font-semibold text-red-500 transition hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
