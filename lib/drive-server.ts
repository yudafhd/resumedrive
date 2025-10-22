import { Readable } from "node:stream";
import { google, drive_v3 } from "googleapis";
import { ALLOWED_MIME_TYPES } from "./mime";

const APP_PROPERTY_KEY = "app";
const APP_PROPERTY_VALUE = "resumedrive";

type DriveFile = drive_v3.Schema$File;

export function createDriveClient(accessToken: string) {
  if (!accessToken) {
    throw new Error("Missing Google access token");
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}

type UploadServerOptions = {
  accessToken: string;
  name: string;
  mimeType: string;
  data: Buffer;
  parents?: string[];
  fileId?: string;
};

export async function uploadFileServer({
  accessToken,
  name,
  mimeType,
  data,
  parents,
  fileId,
}: UploadServerOptions): Promise<DriveFile> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("Unsupported MIME type");
  }

  const drive = createDriveClient(accessToken);
  const media: drive_v3.Schema$Media = {
    mimeType,
    body: Readable.from(data),
  };

  const resource: drive_v3.Schema$File = {
    name,
    mimeType,
    appProperties: {
      [APP_PROPERTY_KEY]: APP_PROPERTY_VALUE,
    },
  };

  if (parents?.length) {
    resource.parents = parents;
  }

  if (fileId) {
    const response = await drive.files.update({
      fileId,
      media,
      requestBody: resource,
      fields: "id,name,mimeType,modifiedTime,iconLink",
    });
    return response.data;
  }

  const response = await drive.files.create({
    media,
    requestBody: resource,
    fields: "id,name,mimeType,modifiedTime,iconLink",
  });
  return response.data;
}

type DownloadServerOptions = {
  accessToken: string;
  fileId: string;
};

export async function downloadFileServer({
  accessToken,
  fileId,
}: DownloadServerOptions): Promise<{ metadata: DriveFile; data: Buffer }> {
  const drive = createDriveClient(accessToken);

  const metadataResponse = await drive.files.get({
    fileId,
    fields: "id,name,mimeType,modifiedTime,iconLink",
  });

  const downloadResponse = await drive.files.get(
    {
      fileId,
      alt: "media",
    },
    { responseType: "arraybuffer" },
  );

  return {
    metadata: metadataResponse.data,
    data: Buffer.from(downloadResponse.data as ArrayBuffer),
  };
}

type ListServerOptions = {
  accessToken: string;
  folderId?: string;
  pageSize?: number;
  mimeTypes?: string[];
};

export async function listFilesServer({
  accessToken,
  folderId,
  pageSize = 20,
  mimeTypes = ALLOWED_MIME_TYPES,
}: ListServerOptions): Promise<DriveFile[]> {
  const drive = createDriveClient(accessToken);

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

  const response = await drive.files.list({
    q: conditions.join(" and "),
    fields: "files(id,name,mimeType,modifiedTime,iconLink)",
    pageSize,
    orderBy: "modifiedTime desc",
    spaces: "drive",
  });

  return response.data.files ?? [];
}
