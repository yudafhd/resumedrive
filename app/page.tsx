"use client";

import { useSearchParams } from "next/navigation";
import {
    ChangeEvent,
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useResource } from "@/lib/async";
import { cache } from "@/lib/cache";
import { Toast, ToastMessage } from "@/components/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { EditorTab, PreviewTab } from "@/components/ResumeEditorTabs";
import type { DriveFile } from "@/lib/drive-server";
import {
    type CvData as ResumeData,
    defaultCv as defaultResume,
} from "@/lib/cv";
import { MIME_JSON } from "@/lib/mime";
import {
    clearDraft,
    readDraft,
    saveDraft,
} from "@/lib/storage";
import HeaderBar from "@/components/HeaderBar";
import LeftPanel from "@/components/LeftPanel";
import { fetchAppSettings, saveAppSettings } from "@/lib/settings-client";
import { createSettingsPayload } from "@/lib/app-settings";
import type { AppSettings } from "@/lib/app-settings";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useTranslation } from "@/components/providers/LanguageProvider";

type ToastType = ToastMessage["variant"];
type TabId = "editor" | "preview" | "config";

function ResumeEditorPageContent() {
    const searchParams = useSearchParams();
    const { accessToken, isAuthenticated } = useAuth();
    const { upload: uploadAppData } = useAppData();
    const { t } = useTranslation();

    const initialFileId = searchParams.get("fileId");
    const requestedMime = searchParams.get("mimeType") ?? undefined;
    const hasDraftFlag = Boolean(searchParams.get("draft"));

    const [resume, setResume] = useState<ResumeData>(defaultResume);
    const [fileName, setFileName] = useState<string>("Resume.json");
    const [currentFileId, setCurrentFileId] = useState<string | null>(
        initialFileId,
    );
    const [currentMime, setCurrentMime] = useState<string>(
        requestedMime ?? MIME_JSON,
    );
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const toastIdRef = useRef(0);
    const [activeTab, setActiveTab] = useState<TabId>("editor");
    const previewRef = useRef<HTMLDivElement | null>(null);

    // UI drawers/toggles
    const [leftPanelOpen, setLeftPanelOpen] = useState(false);

    const settingsResourceKey = `settings:appData:${accessToken ?? "anonymous"}`;
    const { data: settingsData } = useResource<AppSettings | null>(
        settingsResourceKey,
        async (signal) => {
            if (!accessToken) return null;
            return fetchAppSettings(accessToken, signal);
        },
        { staleTime: 0 },
    );
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        if (settingsData !== undefined) {
            setSettings(settingsData);
        }
    }, [settingsData]);

    useEffect(() => {
        if (!settings) return;
        if (!initialFileId) {
            const targetFileId = settings.recentResumeId ?? null;
            if (targetFileId !== currentFileId) {
                setCurrentFileId(targetFileId);
            }
        }
    }, [settings, currentFileId, initialFileId]);

    const showToast = (message: string, variant: ToastType = "info") => {
        toastIdRef.current += 1;
        setToast({ id: toastIdRef.current, message, variant });
    };

    const persistSettings = useCallback(
        async (updates: Partial<AppSettings>) => {
            if (!accessToken) {
                throw new Error("Cannot update settings without Google access token");
            }
            const previous = settings;
            const merged: Partial<AppSettings> = { ...(previous ?? {}), ...updates };
            const optimistic = createSettingsPayload(merged);
            setSettings(optimistic);
            cache.set(settingsResourceKey, optimistic);
            try {
                const saved = await saveAppSettings(accessToken, merged);
                setSettings(saved);
                cache.set(settingsResourceKey, saved);
                return saved;
            } catch (error) {
                setSettings(previous ?? null);
                cache.set(settingsResourceKey, previous ?? null);
                throw error;
            }
        },
        [accessToken, settings, settingsResourceKey],
    );

    const handleDownloadPdf = () => {
        if (!previewRef.current) {
            showToast(t("page.previewRequired"), "error");
            return;
        }

        if (typeof window === "undefined") return;

        const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #111827; }
        h1,h2,h3 { color: #111827; }
        .section { margin-bottom: 24px; }
        .tag { display: inline-block; padding: 6px 12px; border-radius: 999px; border: 1px solid #1e40af; color: #1e40af; margin: 4px 8px 0 0; font-size: 12px; font-weight: 600; }
        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .meta { color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      </style>
    `;

        // Create hidden iframe to avoid popup blockers
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.style.visibility = "hidden";
        iframe.setAttribute("sandbox", "allow-modals allow-same-origin allow-scripts");
        document.body.appendChild(iframe);

        const w = iframe.contentWindow;
        if (!w || !w.document) {
            showToast(t("page.printPreviewError"), "error");
            try {
                document.body.removeChild(iframe);
            } catch { }
            return;
        }

        const doc = w.document;
        doc.open();
        doc.write(
            `<html><head><title>${fileName.replace(/\.[^.]+$/, "")}</title>${styles}</head><body>${previewRef.current.outerHTML}</body></html>`
        );
        doc.close();

        const triggerPrint = () => {
            setTimeout(() => {
                try {
                    w.focus();
                    w.print();
                } catch { }
            }, 150);
        };

        if (doc.readyState === "complete") {
            triggerPrint();
        } else {
            w.addEventListener("load", triggerPrint, { once: true } as AddEventListenerOptions);
        }

        w.addEventListener(
            "afterprint",
            () => {
                try {
                    document.body.removeChild(iframe);
                } catch { }
            },
            { once: true } as AddEventListenerOptions
        );
    };

    const fileKey = ["file:current", accessToken ?? "", currentFileId ?? ""];
    const fileQuery = useResource(
        fileKey,
        async (signal) => {
            if (!accessToken || !currentFileId) return undefined;
            const params = new URLSearchParams({ fileId: currentFileId });
            const response = await fetch(`/api/drive/download?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                signal,
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body?.message ?? "Failed to download file from Drive");
            }
            const payload = (await response.json()) as { metadata: DriveFile; data: string };
            const text = decodeBase64ToString(payload.data);
            return {
                metadata: payload.metadata,
                mimeType: payload.metadata.mimeType ?? MIME_JSON,
                data: JSON.parse(text) as ResumeData,
            };
        },
        { staleTime: 0 }
    );

    useEffect(() => {
        if (fileQuery.data?.data) {
            setResume(fileQuery.data.data);
            setFileName(fileQuery.data.metadata?.name ?? deriveFileName(fileQuery.data.mimeType));
            setCurrentMime(fileQuery.data.mimeType);
        }
    }, [fileQuery.data, currentFileId]);

    useEffect(() => {
        if (!fileQuery.data && hasDraftFlag) {
            const draft = readDraft<ResumeData>();
            if (draft) {
                try {
                    setResume(draft);
                    setFileName("Resume.json");
                    setCurrentFileId(null);
                    setCurrentMime(MIME_JSON);
                    showToast(t("page.loadedDraft"), "success");
                } catch (error) {
                    showToast(
                        error instanceof Error ? error.message : t("page.invalidDraft"),
                        "error",
                    );
                }
            }
        }
    }, [fileQuery.data, hasDraftFlag, t]);

    useEffect(() => {
        saveDraft(resume);
    }, [resume]);

    const handleSaveJson = async () => {
        if (!accessToken) {
            showToast(t("page.signInToSave"), "error");
            return;
        }

        setIsSaving(true);
        try {
            const name = ensureExtension(fileName, ".json");
            const result = await uploadAppData({
                name,
                mimeType: MIME_JSON,
                data: JSON.stringify(resume, null, 2),
                fileId: currentMime === MIME_JSON ? currentFileId ?? undefined : undefined,
            });
            setCurrentFileId(result.id ?? null);
            setCurrentMime(MIME_JSON);
            setFileName(result.name ?? "");
            try {
                await persistSettings({
                    recentResumeId: result.id ?? null,
                });
            } catch (settingsError) {
                showToast(
                    settingsError instanceof Error
                        ? t("page.saveSettingsFailed", { message: `: ${settingsError.message}` })
                        : t("page.saveSettingsFailed", { message: "" }),
                    "error",
                );
            }
            cache.invalidate(["file:current", accessToken ?? "", currentFileId ?? ""]);
            showToast(
                t("page.savedToDrive", { name: result.name ?? name }),
                "success",
            );
            clearDraft();
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : t("page.saveJsonFailed"),
                "error",
            );
        } finally {
            setIsSaving(false);
        }
    };



    const handleImportJson = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            setResume(JSON.parse(text));
            setCurrentMime(MIME_JSON);
            setFileName(ensureExtension(file.name, ".json"));
            setCurrentFileId(null);
            if (accessToken) {
                try {
                    await persistSettings({ recentResumeId: null });
                } catch (settingsError) {
                    showToast(
                        settingsError instanceof Error
                            ? t("page.importedSettingsFailed", { message: `: ${settingsError.message}` })
                            : t("page.importedSettingsFailed", { message: "" }),
                        "error",
                    );
                }
            }
            showToast(t("page.importedFile", { name: file.name }), "success");
        } catch (error) {
            if (error instanceof SyntaxError) {
                showToast(t("page.invalidJson"), "error");
            } else {
                showToast(
                    error instanceof Error ? error.message : t("page.importFailed"),
                    "error",
                );
            }
        } finally {
            event.target.value = "";
        }
    };

    const handleSelectDriveFile = async (fileId: string) => {
        if (!accessToken) {
            showToast(t("page.signInToLoad"), "error");
            return;
        }
        try {
            if (fileId !== currentFileId) {
                setCurrentFileId(fileId);
            }
            try {
                await persistSettings({
                    recentResumeId: fileId,
                });
            } catch (settingsError) {
                showToast(
                    settingsError instanceof Error
                        ? t("page.loadedSettingsFailed", { message: `: ${settingsError.message}` })
                        : t("page.loadedSettingsFailed", { message: "" }),
                    "error",
                );
            }

            await fileQuery.refetch();
            if (fileQuery.error) {
                throw fileQuery.error as Error;
            }

            showToast(t("page.loadedFromDrive"), "success");
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : t("page.loadFailed"),
                "error",
            );
        }
    };

    const downloadJson = () => {
        const blob = new Blob([JSON.stringify(resume, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = ensureExtension(fileName, ".json");
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)]">
            <HeaderBar
                activeTab={activeTab === "preview" ? "preview" : "editor"}
                onTabChange={(t) => setActiveTab(t)}
                onToggleLeft={() => setLeftPanelOpen((v) => !v)}
            />
            <main id="main-content" className="mx-auto max-w-7xl px-4 md:px-6 py-6" role="main">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-10">
                    <div className="hidden md:block col-span-3">
                        <LeftPanel
                            onSave={handleSaveJson}
                            onImport={handleImportJson}
                            onDownloadJson={downloadJson}
                            isAuthenticated={Boolean(isAuthenticated)}
                            onSelectFile={handleSelectDriveFile}
                            loading={isSaving}
                        />
                    </div>
                    {activeTab === "editor" ? <div className="col-span-7 space-y-4">
                        <EditorTab
                            resume={resume}
                            onChange={setResume}
                        />
                    </div> : <div className="col-span-7 space-y-4">
                        <PreviewTab
                            resume={resume}
                            onDownloadPdf={handleDownloadPdf}
                            previewRef={previewRef}
                        />
                    </div>}
                </div>
            </main>

            {/* Mobile left panel drawer */}
            <div className={`fixed inset-0 z-50 transition-opacity ${leftPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    aria-hidden="true"
                    onClick={() => setLeftPanelOpen(false)}
                />
                <div className={`absolute inset-y-0 left-0 max-w-[90vw] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] shadow-xl transition-transform duration-300 ease-in-out ${leftPanelOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="flex h-14 items-center justify-end border-b border-[var(--color-border)] px-3">
                        <button
                            type="button"
                            aria-label="Close left panel"
                            onClick={() => setLeftPanelOpen(false)}
                            className="inline-flex items-center justify-center rounded-md p-3 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)] min-h-[44px] min-w-[44px]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    <div className="h-[calc(100vh-56px)] overflow-y-auto overscroll-contain p-4">
                        <LeftPanel
                            onSave={handleSaveJson}
                            onImport={handleImportJson}
                            onDownloadJson={downloadJson}
                            isAuthenticated={Boolean(isAuthenticated)}
                            onSelectFile={handleSelectDriveFile}
                            loading={isSaving}
                        />
                    </div>
                </div>
            </div>

            {toast && (
                <div className="fixed top-4 right-4 z-[60] space-y-2">
                    <Toast
                        {...toast}
                        onDismiss={() => setToast(null)}
                    />
                </div>
            )}
        </div>
    );
}

export default function ResumeEditorPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-white text-slate-600">
                    Loading…
                </div>
            }
        >
            <ResumeEditorPageContent />
        </Suspense>
    );
}

function ensureExtension(name: string, extension: ".json" = ".json") {
    const trimmed = name.trim();
    if (trimmed.toLowerCase().endsWith(extension)) {
        return trimmed;
    }
    return replaceExtension(trimmed, extension);
}

function replaceExtension(name: string, extension: ".json" = ".json") {
    const base = name.replace(/\.(json|xlsx)$/i, "");
    return `${base}${extension}`;
}

function deriveFileName(mimeType: string) {
    return mimeType === MIME_JSON ? "Resume.json" : "Resume";
}

function decodeBase64ToString(base64: string) {
    if (typeof window === "undefined" || typeof window.atob !== "function") {
        throw new Error("Base64 decoding requires a browser environment");
    }
    const binary = window.atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
}
