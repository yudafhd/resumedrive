'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { PickerButton } from "@/components/PickerButton";
import { FileList } from "@/components/FileList";
import { Toast, ToastMessage } from "@/components/Toast";
import { QuickStartChecklist } from "@/components/QuickStartChecklist";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  DriveFile,
  listFiles,
  uploadFile,
} from "@/lib/drive-client";
import { defaultCv } from "@/lib/cv";
import { MIME_XLSX } from "@/lib/mime";
import { jsonToXlsx, xlsxToJson } from "@/lib/xlsx";
import {
  getStoredFileId,
  getStoredFolderId,
  saveDraft,
  setStoredFileId,
  setStoredFolderId,
} from "@/lib/storage";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated } = useAuth();

  const [folderId, setFolderId] = useState<string | null>(() => getStoredFolderId());
  const [preferredFileId, setPreferredFileId] = useState<string | null>(() => getStoredFileId());
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isCreatingXlsx, setIsCreatingXlsx] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastIdRef = useRef(0);

  useEffect(() => {
    setStoredFolderId(folderId);
  }, [folderId]);

  useEffect(() => {
    setStoredFileId(preferredFileId);
  }, [preferredFileId]);

  const filesQuery = useQuery({
    queryKey: ["drive-files", accessToken, folderId],
    queryFn: async () => {
      if (!accessToken) {
        return [];
      }
      return listFiles({
        accessToken,
        folderId: folderId ?? undefined,
      });
    },
    enabled: Boolean(accessToken),
  });

  const files = useMemo(
    () => filesQuery.data ?? [],
    [filesQuery.data],
  );

  const selectedFile = useMemo<DriveFile | null>(() => {
    if (!preferredFileId) return null;
    return files.find((file) => file.id === preferredFileId) ?? null;
  }, [files, preferredFileId]);

  const showToast = (message: string, variant: ToastMessage["variant"] = "info") => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message, variant });
  };

  const handlePickerResult = (doc: {
    id: string;
    name: string;
    mimeType: string;
    isFolder: boolean;
  }) => {
    if (doc.isFolder) {
      setFolderId(doc.id);
      showToast(`Folder "${doc.name}" selected.`);
      queryClient.invalidateQueries({ queryKey: ["drive-files"] });
    } else {
      setPreferredFileId(doc.id);
      showToast(`Ready to edit "${doc.name}".`, "success");
      router.push(`/cv/editor?fileId=${doc.id}`);
    }
  };

  const handleNewJson = () => {
    saveDraft(defaultCv);
    router.push("/cv/editor?draft=1&mimeType=application/json");
  };

  const handleNewXlsx = async () => {
    if (!accessToken) {
      showToast("Sign in first to create files.", "error");
      return;
    }

    setIsCreatingXlsx(true);
    try {
      const blob = jsonToXlsx(defaultCv);
      const timestamp = new Date().toISOString().split("T")[0];
      const created = await uploadFile({
        accessToken,
        name: `Resume ${timestamp}.xlsx`,
        mimeType: MIME_XLSX,
        data: blob,
        parents: folderId ? [folderId] : undefined,
      });
      showToast(`Created ${created.name} in Drive.`, "success");
      queryClient.invalidateQueries({ queryKey: ["drive-files"] });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to create XLSX file.",
        "error",
      );
    } finally {
      setIsCreatingXlsx(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const cv = await xlsxToJson(file);
      saveDraft(cv);
      showToast(`Imported ${file.name}.`, "success");
      router.push("/cv/editor?draft=1");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to import XLSX.",
        "error",
      );
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              ResumeDrive
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Build your CV and keep it safely in your Google Drive
            </h1>
            <p className="max-w-2xl text-base text-slate-600">
              Sign in with Google, pick a folder, and sync your resume as JSON or
              Excel. Minimal Drive scope, no server session, ready for Vercel.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <GoogleSignInButton
              onSignedIn={() => {
                filesQuery.refetch();
                showToast("Signed in successfully.", "success");
              }}
              onError={(message) => showToast(message, "error")}
            />
            {isAuthenticated && (
              <PickerButton
                accessToken={accessToken ?? ""}
                apiKey={GOOGLE_API_KEY}
                onPicked={handlePickerResult}
                onError={(message) => showToast(message, "error")}
              />
            )}
            {!GOOGLE_API_KEY && (
              <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                Add NEXT_PUBLIC_GOOGLE_API_KEY in .env.local
              </span>
            )}
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleNewJson}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                New JSON draft
              </button>
              <button
                type="button"
                onClick={handleNewXlsx}
                disabled={isCreatingXlsx}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
              >
                {isCreatingXlsx ? "Creating…" : "New XLSX in Drive"}
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Import XLSX → JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <Link
                  href={`/cv/editor?fileId=${selectedFile.id}`}
                  className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Continue editing {selectedFile.name}
                </Link>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Drive overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Files are tagged with <code>appProperties.app = &quot;resumedrive&quot;</code> so only
                the documents you create or pick stay in scope.
              </p>
              <div className="mt-6">
                <FileList
                  files={files}
                  isLoading={filesQuery.isLoading}
                  onSelect={(file) => {
                    setPreferredFileId(file.id);
                    router.push(`/cv/editor?fileId=${file.id}`);
                  }}
                  onRefresh={() => filesQuery.refetch()}
                />
              </div>
            </div>
          </div>

          <QuickStartChecklist />
        </section>
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
