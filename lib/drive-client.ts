import { withBackoff } from "./backoff";
import { ALLOWED_MIME_TYPES, MIME_JSON, MIME_XLSX } from "./mime";

const DRIVE_BASE_URL = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const APP_PROPERTY_KEY = "app";
const APP_PROPERTY_VALUE = "resumedrive";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  iconLink?: string;
};

type AuthenticatedFetchOptions = RequestInit & { accessToken: string };

async function authenticatedFetch(
  url: string,
  { accessToken, headers, ...init }: AuthenticatedFetchOptions,
) {
  return withBackoff(() =>
    fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(headers ?? {}),
      },
    }).then(async (response) => {
      if (!response.ok) {
        const errorBody = await safeJson(response);
        const error = new Error(
          `Google Drive request failed: ${response.status}`,
        );
        (error as Error & { details?: unknown }).details = errorBody;
        throw error;
      }
      return response;
    }),
  );
}

async function safeJson(response: Response) {
  try {
    return await response.clone().json();
  } catch {
    return undefined;
  }
}

type ListFilesOptions = {
  accessToken: string;
  pageSize?: number;
  folderId?: string;
  mimeTypes?: string[];
};

export async function listFiles({
  accessToken,
  pageSize = 20,
  folderId,
  mimeTypes = ALLOWED_MIME_TYPES,
}: ListFilesOptions): Promise<DriveFile[]> {
  const conditions = [
    `appProperties has { key='${APP_PROPERTY_KEY}' and value='${APP_PROPERTY_VALUE}' }`,
  ];

  if (folderId) {
    conditions.push(`'${folderId}' in parents`);
  }

  if (mimeTypes.length) {
    const mimeQueries = mimeTypes.map((type) => `mimeType='${type}'`);
    conditions.push(`(${mimeQueries.join(" or ")})`);
  }

  const params = new URLSearchParams({
    q: conditions.join(" and "),
    fields: "files(id,name,mimeType,modifiedTime,iconLink)",
    pageSize: pageSize.toString(),
    spaces: "drive",
    orderBy: "modifiedTime desc",
  });

  const response = await authenticatedFetch(
    `${DRIVE_BASE_URL}/files?${params.toString()}`,
    {
      accessToken,
    },
  );

  const payload = (await response.json()) as { files?: DriveFile[] };
  return payload.files ?? [];
}

type UploadOptions = {
  accessToken: string;
  name: string;
  mimeType: string;
  data: Blob | File | string;
  parents?: string[];
  fileId?: string;
};

export async function uploadFile({
  accessToken,
  name,
  mimeType,
  data,
  parents,
  fileId,
}: UploadOptions): Promise<DriveFile> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("Unsupported MIME type");
  }

  const metadata: Record<string, unknown> = {
    name,
    mimeType,
    appProperties: {
      [APP_PROPERTY_KEY]: APP_PROPERTY_VALUE,
    },
  };

  if (parents?.length) {
    metadata.parents = parents;
  }

  const boundary = `-------314159265358979323846`;
  const bodyParts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
  ];

  const dataBlob =
    typeof data === "string" ? new Blob([data], { type: mimeType }) : data;

  const endBoundary = `\r\n--${boundary}--`;
  const body = new Blob([...bodyParts.map((part) => new Blob([part])), dataBlob, new Blob([endBoundary])]);

  const url = new URL(fileId ? `${DRIVE_UPLOAD_URL}/${fileId}` : DRIVE_UPLOAD_URL);
  url.searchParams.set("uploadType", "multipart");
  url.searchParams.set("fields", "id,name,mimeType,modifiedTime,iconLink");

  const response = await authenticatedFetch(url.toString(), {
    accessToken,
    method: fileId ? "PATCH" : "POST",
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  return (await response.json()) as DriveFile;
}

type DownloadOptions = {
  accessToken: string;
  fileId: string;
  mimeType?: string;
};

export async function downloadFile({
  accessToken,
  fileId,
  mimeType,
}: DownloadOptions): Promise<Blob> {
  const url = new URL(`${DRIVE_BASE_URL}/files/${fileId}`);
  url.searchParams.set("alt", "media");

  const response = await authenticatedFetch(url.toString(), {
    accessToken,
  });

  return await response.blob().then((blob) => {
    if (mimeType) {
      return blob.type === mimeType ? blob : blob.slice(0, blob.size, mimeType);
    }
    return blob;
  });
}

export async function getFileMetadata(
  accessToken: string,
  fileId: string,
): Promise<DriveFile> {
  const url = `${DRIVE_BASE_URL}/files/${fileId}?fields=id,name,mimeType,modifiedTime,iconLink`;
  const response = await authenticatedFetch(url, { accessToken });
  return (await response.json()) as DriveFile;
}

export async function readJsonFile(accessToken: string, fileId: string) {
  const blob = await downloadFile({
    accessToken,
    fileId,
    mimeType: MIME_JSON,
  });
  const text = await blob.text();
  return JSON.parse(text);
}

export async function readXlsxFile(accessToken: string, fileId: string) {
  return downloadFile({
    accessToken,
    fileId,
    mimeType: MIME_XLSX,
  });
}
