"use client";

import { DriveFile } from "@/lib/drive-client";

type FileListProps = {
  files: DriveFile[];
  isLoading?: boolean;
  onSelect: (file: DriveFile) => void;
  onRefresh?: () => void;
};

export function FileList({
  files,
  isLoading,
  onSelect,
  onRefresh,
}: FileListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
        Loading files from Google Drive…
      </div>
    );
  }

  if (!files.length) {
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
        <h3 className="text-sm font-semibold text-slate-600">Drive files</h3>
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
        {files.map((file) => (
          <li key={file.id}>
            <button
              type="button"
              onClick={() => onSelect(file)}
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-400 hover:shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  {file.name}
                </span>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {file.mimeType}
                </span>
              </div>
              {file.modifiedTime && (
                <p className="mt-1 text-xs text-slate-500">
                  Updated {new Date(file.modifiedTime).toLocaleString()}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
