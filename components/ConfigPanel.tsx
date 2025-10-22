"use client";

import { useRef, useState } from "react";
import { Toast, ToastMessage } from "@/components/Toast";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { PickerButton } from "@/components/PickerButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useResource } from "@/lib/async";
import { cache } from "@/lib/cache";
import {
  DriveFile,
  listFiles,
} from "@/lib/drive-client";
import {
  getStoredFolderId,
} from "@/lib/storage";

type ConfigPanelProps = {
  folderId?: string | null;
};

export function ConfigPanel({ }: ConfigPanelProps) {
  const toastIdRef = useRef(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [folderId, setFolderId] = useState<string | null>(() => getStoredFolderId());
  const { accessToken, isAuthenticated } = useAuth();

  const enabled = Boolean(accessToken);
  const listKey = ["drive:list", { folderId, pageSize: 20, mimeTypes: undefined }];
  const { refetch: refetchFiles } = useResource<DriveFile[]>(
    listKey,
    async () => {
      if (!enabled) return [];
      return listFiles({
        accessToken: accessToken!,
        folderId: folderId ?? undefined,
      });
    },
    { staleTime: 30_000 }
  );

  const handlePickerResult = (doc: {
    id: string;
    name: string;
    mimeType: string;
    isFolder: boolean;
  }) => {
    if (doc.isFolder) {
      setFolderId(doc.id);
      showToast(`Folder "${doc.name}" selected.`);
      cache.invalidatePrefix("drive:list");
    } else {
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
              refetchFiles();
              showToast("Signed in successfully.", "success");
            }}
            onError={(message) => showToast(message, "error")}
          />
          {isAuthenticated && (
            <PickerButton
              accessToken={accessToken ?? ""}
              onPicked={handlePickerResult}
              onError={(message) => showToast(message, "error")}
            />
          )}
        </div>
      </header>

      <dl className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Target folder
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            {folderId ?? "No folder selected (Drive root)"}
          </dd>
        </div>
      </dl>

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

