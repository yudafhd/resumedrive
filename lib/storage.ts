const STORAGE_KEYS = {
  folder: "resumedrive.folder",
  file: "resumedrive.file",
  draft: "resumedrive.cvDraft",
};

export function getStoredFolderId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.folder);
}

export function setStoredFolderId(folderId: string | null) {
  if (typeof window === "undefined") return;
  if (!folderId) {
    window.localStorage.removeItem(STORAGE_KEYS.folder);
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.folder, folderId);
}

export function getStoredFileId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.file);
}

export function setStoredFileId(fileId: string | null) {
  if (typeof window === "undefined") return;
  if (!fileId) {
    window.localStorage.removeItem(STORAGE_KEYS.file);
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.file, fileId);
}

export function saveDraft(data: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(data));
}

export function readDraft<T = unknown>() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.draft);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.draft);
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.draft);
}

export { STORAGE_KEYS };
