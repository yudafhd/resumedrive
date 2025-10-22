"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthState = {
  accessToken: string | null;
  expiresAt: number | null;
};

type AuthContextValue = {
  accessToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  setCredentials: (token: string, expiresIn: number) => void;
  clearCredentials: () => void;
};

const STORAGE_KEY = "resumedrive.auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredState(): AuthState {
  if (typeof window === "undefined") {
    return { accessToken: null, expiresAt: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, expiresAt: null };
    const parsed = JSON.parse(raw) as AuthState;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { accessToken: null, expiresAt: null };
    }
    return parsed;
  } catch {
    return { accessToken: null, expiresAt: null };
  }
}

function writeStoredState(state: AuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(() => readStoredState());

  const setCredentials = useCallback((token: string, expiresIn: number) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    const nextState: AuthState = { accessToken: token, expiresAt };
    setState(nextState);
    writeStoredState(nextState);
  }, []);

  const clearCredentials = useCallback(() => {
    setState({ accessToken: null, expiresAt: null });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setState(readStoredState());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: state.accessToken,
      expiresAt: state.expiresAt,
      isAuthenticated: Boolean(state.accessToken),
      setCredentials,
      clearCredentials,
    }),
    [state.accessToken, state.expiresAt, setCredentials, clearCredentials],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
