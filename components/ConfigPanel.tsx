"use client";

import { useRef, useState } from "react";
import { Toast, ToastMessage } from "@/components/Toast";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useTranslation } from "./providers/LanguageProvider";

export function ConfigPanel() {
  const toastIdRef = useRef(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const { isAuthenticated } = useAuth();
  const { files, loading, refresh } = useAppData();
  const { t, language } = useTranslation();

  const showToast = (
    message: string,
    variant: ToastMessage["variant"] = "info",
  ) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message, variant });
  };

  const handleSignedIn = async () => {
    await refresh();
    showToast(t("configPanel.signedInSuccess"), "success");
  };

  const totalFiles = files.length;
  const latestFile = files.at(0);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {t("configPanel.title")}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t("configPanel.descriptionPrefix")}{" "}
          <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">
            appDataFolder
          </code>
          {t("configPanel.descriptionSuffix")}
        </p>
        <div className="flex flex-wrap items-center gap-4 card">
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
              className="btn border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            >
              {t("configPanel.refreshFiles")}
            </button>
          )}
        </div>
      </header>

      <section className="surface">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {t("configPanel.storedResumes")}
        </h3>
        {isAuthenticated ? (
          <div className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
            {loading ? (
              <p>{t("configPanel.loadingFiles")}</p>
            ) : totalFiles > 0 ? (
              <>
                <p>
                  {t("configPanel.filesSaved", {
                    count: totalFiles,
                    suffix:
                      language === "en"
                        ? totalFiles === 1
                          ? ""
                          : "s"
                        : "",
                  })}
                </p>
                {latestFile && latestFile.modifiedTime && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {t("configPanel.latestUpdate", {
                      date: new Date(latestFile.modifiedTime).toLocaleString(
                        language,
                      ),
                    })}
                  </p>
                )}
              </>
            ) : (
              <p>{t("configPanel.noSavedResumes")}</p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {t("configPanel.connectPrompt")}
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
