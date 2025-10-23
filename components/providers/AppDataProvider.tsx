"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import { useResource } from "@/lib/async";
import { cache } from "@/lib/cache";
import type { DriveFile } from "@/lib/drive-server";
import { fetchJSON } from "@/lib/async";

type AppDataUploadInput = {
  name: string;
  mimeType: string;
  data: Blob | File | string;
  fileId?: string;
};

type AppDataContextValue = {
  files: DriveFile[];
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
  upload: (input: AppDataUploadInput) => Promise<DriveFile>;
  remove: (fileId: string) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

async function serializeUploadInput(input: AppDataUploadInput) {
  const { name, mimeType, fileId } = input;
  let encoding: "base64" | "utf8" = "utf8";
  let dataPayload: string;

  if (typeof input.data === "string") {
    dataPayload = input.data;
  } else {
    encoding = "base64";
    const arrayBuffer = await input.data.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    dataPayload = btoa(binary);
  }

  return {
    name,
    mimeType,
    data: dataPayload,
    encoding,
    fileId,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();

  const listKey = useMemo(
    () => ["appData:list", accessToken ?? "anonymous"] as const,
    [accessToken],
  );

  const { data: files = [], loading, error, refetch } = useResource<DriveFile[]>(
    listKey,
    async (signal) => {
      if (!accessToken) return [];
      const params = new URLSearchParams({ pageSize: "50" });
      const res = await fetchJSON<{ files?: DriveFile[] }>(
        `/api/drive/list?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        signal,
      );
      return res.files ?? [];
    },
    { staleTime: 30_000 },
  );

  const refresh = useCallback(() => refetch(), [refetch]);

  const upload = useCallback(
    async (input: AppDataUploadInput) => {
      if (!accessToken) {
        throw new Error("Missing Google access token");
      }
      const payload = await serializeUploadInput(input);
      const response = await fetch("/api/drive/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to upload file");
      }
      const file = (await response.json()) as DriveFile;
      cache.invalidate(listKey);
      return file;
    },
    [accessToken, listKey],
  );

  const remove = useCallback(
    async (fileId: string) => {
      if (!accessToken) {
        throw new Error("Missing Google access token");
      }
      const response = await fetch("/api/drive/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to delete file");
      }
      cache.invalidate(listKey);
    },
    [accessToken, listKey],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      files,
      loading,
      error,
      refresh,
      upload,
      remove,
    }),
    [files, loading, error, refresh, upload, remove],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return ctx;
}
