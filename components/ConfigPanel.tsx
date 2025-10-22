"use client";

import { useRef, useState } from "react";
import { Toast, ToastMessage } from "@/components/Toast";
import { QuickStartChecklist } from "@/components/QuickStartChecklist";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { PickerButton } from "@/components/PickerButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DriveFile,
  listFiles,
  uploadFile,
} from "@/lib/drive-client";
import {
  getStoredFileId,
  getStoredFolderId,
  saveDraft,
  setStoredFileId,
  setStoredFolderId,
} from "@/lib/storage";

type ConfigPanelProps = {
  folderId?: string | null;
  showEditorLink?: boolean;
};

export function ConfigPanel({
  showEditorLink = true,
}: ConfigPanelProps) {
  const toastIdRef = useRef(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [folderId, setFolderId] = useState<string | null>(() => getStoredFolderId());
  const [preferredFileId, setPreferredFileId] = useState<string | null>(() => getStoredFileId());
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "Not configured";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "Not configured";

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
      // router.push(`/cv/editor?fileId=${doc.id}`);
    }
  };

  const showToast = (message: string, variant: ToastMessage["variant"] = "info") => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message, variant });
  };


  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Save to Google Drive
        </h2>
        <p className="text-sm text-slate-500">
          Double-check your Google credentials and Drive target before uploading.
        </p>
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
              apiKey={apiKey}
              onPicked={handlePickerResult}
              onError={(message) => showToast(message, "error")}
            />
          )}
          {!apiKey && (
            <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Add NEXT_PUBLIC_GOOGLE_API_KEY in .env.local
            </span>
          )}
        </div>
      </header>

      <dl className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-800">
            {clientId}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            NEXT_PUBLIC_GOOGLE_API_KEY
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-800">
            {apiKey}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Target folder
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            {folderId ?? "No folder selected (Drive root)"}
          </dd>
        </div>
      </dl>

      <QuickStartChecklist showEditorLink={showEditorLink} />

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

