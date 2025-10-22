"use client";

import { useSearchParams } from "next/navigation";
import {
    ChangeEvent,
    Suspense,
    useEffect,
    useRef,
    useState,
} from "react";
import { useResource } from "@/lib/async";
import { cache } from "@/lib/cache";
import { Toast, ToastMessage } from "@/components/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    ConfigTab,
    EditorTab,
    PreviewTab,
} from "@/components/ResumeEditorTabs";
import {
    getFileMetadata,
    readJsonFile,
    readXlsxFile,
    uploadFile,
} from "@/lib/drive-client";
import {
    type CvData as ResumeData,
    defaultCv as defaultResume,
} from "@/lib/cv";
import { MIME_JSON, MIME_XLSX } from "@/lib/mime";
import { xlsxToJson } from "@/lib/xlsx";
import {
    clearDraft,
    getStoredFileId,
    getStoredFolderId,
    readDraft,
    saveDraft,
    setStoredFileId,
} from "@/lib/storage";
import sampleResumeJson from "@/dummy-resume.json";

type ToastType = ToastMessage["variant"];
type TabId = "editor" | "preview" | "config";

function ResumeEditorPageContent() {
    const searchParams = useSearchParams();
    const { accessToken } = useAuth();

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
    const [isLoadingFromDrive, setIsLoadingFromDrive] = useState(false);
    const toastIdRef = useRef(0);
    const [folderId, setFolderId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>("editor");
    const sampleResume = sampleResumeJson as ResumeData;
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [storedFileId, setStoredFileIdState] = useState<string | null>(null);


    useEffect(() => {
        setFolderId(getStoredFolderId());
    }, []);

    useEffect(() => {
        const savedId = getStoredFileId();
        if (savedId) {
            setStoredFileIdState(savedId);
            if (!initialFileId) {
                setCurrentFileId(savedId);
            }
        }
    }, [initialFileId]);

    const showToast = (message: string, variant: ToastType = "info") => {
        toastIdRef.current += 1;
        setToast({ id: toastIdRef.current, message, variant });
    };


    const handleLoadSample = () => {
        setResume(sampleResume);
        setCurrentMime(MIME_JSON);
        setFileName("Sample Resume.json");
        showToast("Sample resume loaded.", "success");
    };

    const handleDownloadPdf = () => {
        if (!previewRef.current) {
            showToast("Open the Preview tab before downloading.", "error");
            return;
        }

        if (typeof window === "undefined") return;

        const printWindow = window.open("", "_blank", "noopener,noreferrer");
        if (!printWindow) {
            showToast("Popup blocked. Allow popups to download the PDF.", "error");
            return;
        }

        const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #0f172a; }
        h1,h2,h3 { color: #0f172a; }
        .section { margin-bottom: 24px; }
        .tag { display: inline-block; padding: 6px 12px; border-radius: 999px; border: 1px solid #1d4ed8; color: #1d4ed8; margin: 4px 8px 0 0; font-size: 12px; font-weight: 600; }
        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .meta { color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      </style>
    `;

        printWindow.document.open();
        printWindow.document.write(
            `<html><head><title>${fileName.replace(/\.[^.]+$/, "")}</title>${styles}</head><body>${previewRef.current.outerHTML}</body></html>`,
        );
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const fileKey = ["file:current", accessToken ?? "", currentFileId ?? ""];
    const fileQuery = useResource(
        fileKey,
        async () => {
            if (!accessToken || !currentFileId) return undefined;
            const metadata = await getFileMetadata(accessToken, currentFileId);
            const mimeType = metadata.mimeType ?? MIME_JSON;

            if (mimeType === MIME_JSON) {
                const json = await readJsonFile(accessToken, currentFileId);
                return {
                    metadata,
                    mimeType,
                    data: json,
                };
            }

            if (mimeType === MIME_XLSX) {
                const blob = await readXlsxFile(accessToken, currentFileId);
                const json = await xlsxToJson(blob);
                return {
                    metadata,
                    mimeType,
                    data: json,
                };
            }

            throw new Error(`Unsupported file type: ${mimeType}`);
        },
        { staleTime: 0 }
    );

    useEffect(() => {
        if (fileQuery.data?.data) {
            setResume(fileQuery.data.data);
            setFileName(fileQuery.data.metadata?.name ?? deriveFileName(fileQuery.data.mimeType));
            setCurrentMime(fileQuery.data.mimeType);
            const resolvedId = currentFileId ?? null;
            setStoredFileId(resolvedId);
            setStoredFileIdState(resolvedId);
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
                    showToast("Loaded draft from local storage.", "success");
                } catch (error) {
                    showToast(
                        error instanceof Error ? error.message : "Draft is invalid.",
                        "error",
                    );
                }
            }
        }
    }, [fileQuery.data, hasDraftFlag]);

    useEffect(() => {
        saveDraft(resume);
    }, [resume]);

    const handleSaveJson = async () => {
        if (!accessToken) {
            showToast("Sign in to save your resume.", "error");
            return;
        }

        setIsSaving(true);
        try {
            const name = ensureExtension(fileName, ".json");
            const result = await uploadFile({
                accessToken,
                name,
                mimeType: MIME_JSON,
                data: JSON.stringify(resume, null, 2),
                parents: folderId ? [folderId] : undefined,
                fileId: currentMime === MIME_JSON ? currentFileId ?? undefined : undefined,
            });
            setCurrentFileId(result.id);
            setCurrentMime(MIME_JSON);
            setFileName(result.name);
            setStoredFileId(result.id);
            setStoredFileIdState(result.id);
            cache.invalidate(["file:current", accessToken ?? "", currentFileId ?? ""]);
            cache.invalidatePrefix("drive:list");
            showToast(`Saved ${result.name} to Drive.`, "success");
            clearDraft();
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : "Failed to save JSON.",
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
            setStoredFileId(null);
            setStoredFileIdState(null);
            showToast(`Imported ${file.name}`, "success");
        } catch (error) {
            if (error instanceof SyntaxError) {
                showToast("JSON file is invalid.", "error");
            } else {
                showToast(
                    error instanceof Error ? error.message : "Failed to import JSON.",
                    "error",
                );
            }
        } finally {
            event.target.value = "";
        }
    };

    const handleLoadFromDrive = async () => {
        if (!accessToken) {
            showToast("Sign in to load your resume from Drive.", "error");
            return;
        }

        const fallbackStored = storedFileId ?? getStoredFileId();
        const targetFileId = fallbackStored ?? currentFileId;

        if (!targetFileId) {
            showToast(
                "No Drive resume found. Save one first or pick a file from the Save tab.",
                "info",
            );
            return;
        }

        setIsLoadingFromDrive(true);

        try {
            if (targetFileId !== currentFileId) {
                setCurrentFileId(targetFileId);
            }
            setStoredFileId(targetFileId);
            setStoredFileIdState(targetFileId);

            await fileQuery.refetch();
            if (fileQuery.error) {
                throw fileQuery.error as Error;
            }

            showToast("Resume loaded from Drive.", "success");
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : "Failed to load from Drive.",
                "error",
            );
        } finally {
            setIsLoadingFromDrive(false);
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



    // if (isAuthenticated) {
    //     return (
    //         <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
    //             <h1 className="text-3xl font-bold text-slate-900">
    //                 Sign in to edit your resume
    //             </h1>
    //             <p className="text-sm text-slate-500">
    //                 Head back to the dashboard, connect your Google account, and choose a
    //                 file or folder. We only need the <code>drive.file</code> scope.
    //             </p>
    //         </main>
    //     );
    // }

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-12">
                <header className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">RESUME DRIVE</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Update your resume content and sync it to Google Drive as JSON or
                            XLSX. Changes are saved locally until you upload.
                        </p>
                    </div>
                </header>

                <nav className="flex flex-wrap gap-2">
                    <TabButton
                        id="editor"
                        label="Form"
                        activeTab={activeTab}
                        onSelect={setActiveTab}
                    />
                    <TabButton
                        id="preview"
                        label="Preview"
                        activeTab={activeTab}
                        onSelect={setActiveTab}
                    />
                    <TabButton
                        id="config"
                        label="Save Resume"
                        activeTab={activeTab}
                        onSelect={setActiveTab}
                    />
                </nav>



                {activeTab === "editor" && (
                    <EditorTab
                        resume={resume}
                        onChange={setResume}
                        onLoadSample={handleLoadSample}
                    />
                )}

                {activeTab === "preview" && (
                    <PreviewTab
                        resume={resume}
                        onDownloadPdf={handleDownloadPdf}
                        previewRef={previewRef}
                    />
                )}

                {activeTab === "config" && (
                    <ConfigTab
                        fileName={fileName}
                        onFileNameChange={setFileName}
                        isSaving={isSaving}
                        canLoadFromDrive={Boolean(accessToken && (storedFileId ?? currentFileId))}
                        isLoadingFromDrive={isLoadingFromDrive}
                        onSaveJson={handleSaveJson}
                        onLoadFromDrive={handleLoadFromDrive}
                        onDownloadJson={downloadJson}
                        onImportJson={handleImportJson}
                        folderId={folderId}
                    />
                )}
            </div>

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
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

function ensureExtension(name: string, extension: ".json" | ".xlsx") {
    const trimmed = name.trim();
    if (trimmed.toLowerCase().endsWith(extension)) {
        return trimmed;
    }
    return replaceExtension(trimmed, extension);
}

function replaceExtension(name: string, extension: ".json" | ".xlsx") {
    const base = name.replace(/\.(json|xlsx)$/i, "");
    return `${base}${extension}`;
}

function deriveFileName(mimeType: string) {
    if (mimeType === MIME_XLSX) {
        return "Resume.xlsx";
    }
    return "Resume.json";
}

type TabButtonProps = {
    id: TabId;
    label: string;
    activeTab: TabId;
    onSelect: (tab: TabId) => void;
};

function TabButton({ id, label, activeTab, onSelect }: TabButtonProps) {
    const isActive = id === activeTab;
    return (
        <button
            type="button"
            onClick={() => onSelect(id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${isActive
                ? "border-blue-500 bg-blue-50 text-blue-600 shadow"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                }`}
        >
            {label}
        </button>
    );
}
