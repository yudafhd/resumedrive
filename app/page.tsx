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
import ResumePdfDocument from "@/components/pdf/ResumePdfDocument";
import { fetchAppSettings, saveAppSettings } from "@/lib/settings-client";
import { createSettingsPayload } from "@/lib/app-settings";
import type { AppSettings } from "@/lib/app-settings";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useTranslation } from "@/components/providers/LanguageProvider";
import Link from "next/link";

type ToastType = ToastMessage["variant"];
type TabId = "editor" | "preview" | "config";

function ResumeEditorPageContent() {
    const searchParams = useSearchParams();
    const { accessToken, isAuthenticated } = useAuth();
    const { upload: uploadAppData } = useAppData();
    const { t, language } = useTranslation();

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
    const [isExportingPdf, setIsExportingPdf] = useState(false);
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
        if (typeof window === "undefined" || isExportingPdf) return;

        const labels = {
            summary: t("resumePreview.summary"),
            experience: t("resumePreview.experience"),
            education: t("resumePreview.education"),
            skills: t("resumePreview.skills"),
            present: t("resumePreview.present"),
            fallbackName: t("resumePreview.fallbackName"),
            fallbackTitle: t("resumePreview.fallbackTitle"),
            additional: t("resumePreview.additional"),
        };

        const pdfFileName = (() => {
            const trimmed = fileName.trim();
            if (!trimmed) return "Resume.pdf";
            return ensureExtension(trimmed, ".pdf");
        })();

        setIsExportingPdf(true);

        window.setTimeout(async () => {
            try {
                const { pdf } = await import("@react-pdf/renderer");
                const blob = await pdf(
                    <ResumePdfDocument
                        resume={resume}
                        labels={labels}
                        language={language}
                    />,
                ).toBlob();

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = pdfFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Failed to generate PDF", error);
                showToast(t("page.printPreviewError"), "error");
            } finally {
                setIsExportingPdf(false);
            }
        }, 0);
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
                            isExporting={isExportingPdf}
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

                    <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-3">
                        <div className="flex gap-2">
                            <Link
                                href="/"
                                aria-label="Resume Drive home"
                                className="flex items-center gap-3 rounded-[var(--radius-md)] px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)] transition-all"
                            >
                                <span className="text-base font-extrabold tracking-wider">
                                    RESUME DRIVE
                                </span>
                            </Link>
                        </div>
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

function ensureExtension(name: string, extension: string = ".json") {
    const trimmed = name.trim();
    const normalizedExtension = extension.startsWith(".")
        ? extension
        : `.${extension}`;
    if (trimmed.toLowerCase().endsWith(normalizedExtension.toLowerCase())) {
        return trimmed;
    }
    return replaceExtension(trimmed, normalizedExtension);
}

function replaceExtension(name: string, extension: string = ".json") {
    const normalizedExtension = extension.startsWith(".")
        ? extension
        : `.${extension}`;
    const base = name.replace(/\.[^.]+$/i, "");
    return `${base}${normalizedExtension}`;
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
