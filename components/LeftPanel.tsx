"use client";

import { ChangeEvent, useRef } from "react";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { QuickStartChecklist } from "./QuickStartChecklist";
import { useAuth } from "./providers/AuthProvider";
import { FileList } from "./FileList";
import type { DriveFile } from "@/lib/drive-server";
import { useAppData } from "@/components/providers/AppDataProvider";

type LeftPanelProps = {
    isAuthenticated: boolean;
    onSelectFile?: (id: string) => void;
    onSave: () => void;
    onImport: (event: ChangeEvent<HTMLInputElement>) => void;
    onDownloadJson: () => void;
    loading: boolean;
};

export function LeftPanel({ isAuthenticated, onSelectFile, loading: isSaving, onSave, onImport, onDownloadJson }: LeftPanelProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const triggerImport = () => fileInputRef.current?.click();
    const { accessToken } = useAuth();
    const { files, loading, error, refresh, remove } = useAppData();

    // Defensive client-side filter: ensure only JSON files are surfaced,
    // and hide any spreadsheet or .xlsx legacy entries.
    const visibleFiles = (files ?? []).filter((file) => {
        const name = (file.name ?? "").toString();
        const mime = (file.mimeType ?? "").toString();
        if (/\.xlsx$/i.test(name)) return false;
        if (mime.toLowerCase().includes("spreadsheet")) return false;
        return mime === "application/json";
    });

    const handleSelect = (file: DriveFile) => {
        if (!file.id) return;
        if (onSelectFile) {
            onSelectFile(file.id);
        }
    };

    const handleDelete = async (file: DriveFile) => {
        if (!accessToken) return;
        if (!file.id) return;
        const confirmed = window.confirm(`Delete "${file.name}" from Google Drive?`);
        if (!confirmed) return;

        try {
            await remove(file.id);
        } catch (err) {
            console.error("Failed to delete Drive file", err);
            alert(err instanceof Error ? err.message : "Failed to delete file.");
        }
    };

    return (
        <aside className="bg-[var(--surface-subtle)] space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-2">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">Local Drive</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        kamu dapat menyimpan dan mengimport resume secara local di devicemu
                    </p>
                </div>
                <div className="space-x-2">
                    <button
                        type="button"
                        onClick={onDownloadJson}
                        className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label="Download JSON"
                    >
                        Download
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={onImport}
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                    <button
                        type="button"
                        onClick={triggerImport}
                        className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label="Import JSON"
                    >
                        Import
                    </button>
                </div>
            </div>

            {!isAuthenticated ? (
                <div className="space-y-4">
                    <QuickStartChecklist className="bg-[var(--surface)] border-[var(--border)] text-slate-800" />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2 shadow-sm">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Google Drive</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Resumes you save live in Google private <code className="rounded bg-slate-100 px-1 text-xs">appDataFolder</code>.
                                Use the list below to reopen them.
                            </p>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={onSave}
                                disabled={isSaving || loading}
                                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                aria-label="Save to Drive"
                            >
                                {isSaving || loading ? "Loading" : "Save to Drive"}
                            </button>
                        </div>
                    </div>

                    {Boolean(error) && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            Failed to load saved files. Try Refresh.
                        </div>
                    )}

                    <FileList
                        files={visibleFiles}
                        isLoading={isSaving || loading}
                        onSelect={handleSelect}
                        onRefresh={refresh}
                        onDelete={handleDelete}
                        title="Saved files"
                    />
                </div>
            )}
            <GoogleSignInButton />
        </aside>
    );
}

export default LeftPanel;
