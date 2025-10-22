"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "./providers/AuthProvider";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
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
  const [isLoading, setIsLoading] = useState(false);
  const tokenClientRef = useRef<TokenClient | null>(null);

  const ensureTokenClient = useCallback(() => {
    if (tokenClientRef.current) {
      return tokenClientRef.current;
    }

    if (!CLIENT_ID) {
      throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
    }

    const googleIdentity = window.google?.accounts?.oauth2;
    if (!googleIdentity) {
      throw new Error("Google Identity Services failed to load");
    }

    tokenClientRef.current = googleIdentity.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      callback: () => undefined,
    });

    return tokenClientRef.current;
  }, []);

  const handleSignIn = async () => {
    if (!CLIENT_ID) {
      onError?.("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    try {
      setIsLoading(true);
      const client = ensureTokenClient();

      client.callback = (response) => {
        setIsLoading(false);

        if (response.error) {
          onError?.(`Google sign-in failed: ${response.error}`);
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
        error instanceof Error ? error.message : "Failed to start Google sign-in",
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
        className={`rounded-md bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 ${className ?? ""}`}
        disabled
      >
        Missing Google Client ID
      </button>
    );
  }

  return isAuthenticated ? (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500">Connected to Google Drive</span>
      <button
        type="button"
        onClick={handleSignOut}
        className={`rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 ${className ?? ""}`}
      >
        Sign out
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 ${className ?? ""}`}
    >
      {isLoading ? "Connecting..." : label ?? "Sign in with Google"}
    </button>
  );
}
