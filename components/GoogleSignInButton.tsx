"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import { useTranslation } from "./providers/LanguageProvider";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
];
type TokenClient = google.accounts.oauth2.TokenClient;

type GoogleSignInButtonProps = {
  className?: string;
  onSignedIn?: () => void;
  onError?: (message: string) => void;
  label?: string;
};

export function GoogleSignInButton({
  className,
  onSignedIn,
  onError,
  label,
}: GoogleSignInButtonProps) {
  const { isAuthenticated, clearCredentials, setCredentials } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const tokenClientRef = useRef<TokenClient | null>(null);

  const ensureTokenClient = useCallback(() => {
    if (tokenClientRef.current) {
      return tokenClientRef.current;
    }

    if (!CLIENT_ID) {
      throw new Error(t("google.missingClientId"));
    }

    const googleIdentity = window.google?.accounts?.oauth2;
    if (!googleIdentity) {
      throw new Error(t("google.identityFailed"));
    }

    tokenClientRef.current = googleIdentity.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      callback: () => undefined,
    });

    return tokenClientRef.current;
  }, [t]);

  const handleSignIn = async () => {
    if (!CLIENT_ID) {
      onError?.(t("google.missingClientId"));
      return;
    }

    try {
      setIsLoading(true);
      const client = ensureTokenClient();

      client.callback = (response) => {
        setIsLoading(false);

        if (response.error) {
          onError?.(t("google.signInFailed", { error: response.error }));
          return;
        }

        if (response.access_token) {
          const expiresIn = Number(response.expires_in) || 3600;
          setCredentials(response.access_token, expiresIn);
          onSignedIn?.();
        }
      };

      client.requestAccessToken({
        prompt: isAuthenticated ? "" : "consent",
      });
    } catch (error) {
      setIsLoading(false);
      onError?.(
        error instanceof Error ? error.message : t("google.startFailed"),
      );
    }
  };

  const handleSignOut = () => {
    clearCredentials();
  };

  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        // className={`btn bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] ${className ?? ""}`}
        disabled
      >
        {t("google.missingClientId")}
      </button>
    );
  }

  return isAuthenticated ? (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--color-text-muted)]">{t("google.connected")}</span>
      <button
        type="button"
        onClick={handleSignOut}
      >
        {t("google.signOut")}
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      className={`btn bg-[var(--color-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 flex items-center gap-2 ${className ?? ""}`}
    >
      {isLoading ? t("google.connecting") : label ?? t("google.signInWithGoogle")}
    </button>
  );
}
