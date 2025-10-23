"use client";

import { useRef, useState } from "react";
import { Toast, ToastMessage } from "@/components/Toast";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppData } from "@/components/providers/AppDataProvider";

export function ConfigPanel() {
  const toastIdRef = useRef(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const { isAuthenticated } = useAuth();
  const { files, loading, refresh } = useAppData();

  const showToast = (
    message: string,
    variant: ToastMessage["variant"] = "info",
  ) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message, variant });
  };

  const handleSignedIn = async () => {
    await refresh();
    showToast("Signed in successfully.", "success");
  };

  const totalFiles = files.length;
  const latestFile = files.at(0);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Save to Google Drive
        </h2>
        <p className="text-sm text-slate-500">
          Resumes sync to your Google Drive{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            appDataFolder
          </code>
          , keeping them private to this app.
        </p>
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <GoogleSignInButton
            onSignedIn={handleSignedIn}
            onError={(message) => showToast(message, "error")}
          />
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Refresh files
            </button>
          )}
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Stored resumes
        </h3>
        {isAuthenticated ? (
          <div className="mt-2 space-y-1 text-sm text-slate-700">
            {loading ? (
              <p>Loading saved files…</p>
            ) : totalFiles > 0 ? (
              <>
                <p>{totalFiles} file{totalFiles === 1 ? "" : "s"} saved.</p>
                {latestFile && latestFile.modifiedTime && (
                  <p className="text-xs text-slate-500">
                    Latest update:{" "}
                    {new Date(latestFile.modifiedTime).toLocaleString()}
                  </p>
                )}
              </>
            ) : (
              <p>No saved resumes yet.</p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            Connect with Google to create a private backup.
          </p>
        )}
      </section>

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
