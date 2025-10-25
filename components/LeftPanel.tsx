"use client";

import { ChangeEvent, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { QuickStartChecklist } from "./QuickStartChecklist";
import { useAuth } from "./providers/AuthProvider";
import { FileList } from "./FileList";
import LanguageToggle from "./LanguageToggle";
import type { DriveFile } from "@/lib/drive-server";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useTranslation } from "./providers/LanguageProvider";

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
    const { t } = useTranslation();

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
        const confirmed = window.confirm(
            t("leftPanel.confirmDelete", { name: file.name ?? "" }),
        );
        if (!confirmed) return;

        try {
            await remove(file.id);
        } catch (err) {
            console.error("Failed to delete Drive file", err);
            alert(err instanceof Error ? err.message : t("leftPanel.deleteError"));
        }
    };

    return (
        <aside className="space-y-6">
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] px-1 py-1 text-[var(--color-text-primary)] md:hidden">
                <LanguageToggle />
            </div>
            <section className="card space-y-4">
                <header className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("leftPanel.workspaceLabel")}</span>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t("leftPanel.localDraftsTitle")}</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {t("leftPanel.localDraftsDescription")}
                    </p>
                </header>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onDownloadJson}
                        className="btn"
                        aria-label={t("leftPanel.downloadJson")}
                    >
                        {t("leftPanel.downloadJson")}
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
                        className="btn"
                        aria-label={t("leftPanel.importJson")}
                    >
                        {t("leftPanel.importJson")}
                    </button>
                </div>
            </section>

            {!isAuthenticated ? (
                <div className="space-y-4">
                    <GoogleSignInButton />
                    <QuickStartChecklist className="space-y-3 text-[var(--color-text-primary)]" />
                </div>
            ) : (
                <div className="space-y-4">
                    <section className="card space-y-4">
                        <header className="space-y-1">
                            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("leftPanel.driveLabel")}</span>
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t("leftPanel.driveTitle")}</h2>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {t("leftPanel.driveDescriptionPrefix")}{" "}
                                <code className="rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5 text-[var(--text-xs)]">
                                    appDataFolder
                                </code>
                                {t("leftPanel.driveDescriptionSuffix")}
                            </p>
                        </header>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onSave}
                                disabled={isSaving || loading}
                                className="btn bg-[var(--color-primary)] border-transparent text-[var(--color-text-inverse)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
                                aria-label={t("leftPanel.syncToDrive")}
                            >
                                {isSaving || loading ? t("leftPanel.syncingToDrive") : t("leftPanel.syncToDrive")}
                            </button>
                            <button
                                type="button"
                                onClick={refresh}
                                disabled={loading}
                                className="btn"
                            >
                                {t("leftPanel.refresh")}
                            </button>
                        </div>
                    </section>

                    {Boolean(error) && (
                        <div className="rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3 text-xs text-red-600">
                            {t("leftPanel.failedToLoadFiles")}
                        </div>
                    )}

                    <FileList
                        files={visibleFiles}
                        isLoading={isSaving || loading}
                        onSelect={handleSelect}
                        onDelete={handleDelete}
                    />
                    <GoogleSignInButton />
                </div>
            )}
        </aside>
    );
}

export default LeftPanel;
