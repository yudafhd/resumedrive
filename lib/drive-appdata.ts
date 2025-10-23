import 'server-only';
/**
 * Drive appDataFolder helpers for per-user settings storage.
 *
 * Requires OAuth scope:
 *   https://www.googleapis.com/auth/drive.appdata
 *
 * This module provides a small, typed helper to:
 *  - Authenticate a Drive v3 client from a raw OAuth2 user access token
 *  - Find (or create) a settings.json file in the special "appDataFolder"
 *  - Upsert JSON content to that file
 *  - Read and parse the JSON content from that file
 *
 * The file is stored exclusively in the "appDataFolder" space, which is
 * hidden from the user's My Drive but accessible to this app via the
 * drive.appdata scope.
 */

import { Readable } from "node:stream";
import { Buffer } from "node:buffer";
import { google, drive_v3 } from "googleapis";
import type { AppSettings } from "./app-settings";
import { createSettingsPayload, normalizeSettings } from "./app-settings";

// Constants for file location/name and content type
const SETTINGS_FILENAME = "settings.json";
const SETTINGS_MIME = "application/json";

/**
 * getDriveClientFromAccessToken()
 *
 * Given an OAuth2 user access token (already provisioned with the
 * drive.appdata scope), return an authenticated Drive v3 client.
 *
 * Note: Client ID/secret are not required when you already have a valid
 * user access token. We directly set the token on an OAuth2 client.
 */
export function getDriveClientFromAccessToken(
    accessToken: string,
): drive_v3.Drive {
    if (!accessToken) {
        throw new Error("getDriveClientFromAccessToken: missing access token");
    }
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: accessToken });
    return google.drive({ version: "v3", auth: oauth2 });
}

/**
 * findSettingsFileId()
 *
 * Private helper to query the appDataFolder for a file named "settings.json"
 * with the JSON MIME type and not trashed. Returns the first file ID if
 * multiple exist, or null if not found.
 *
 * Query details:
 *  - spaces: "appDataFolder"
 *  - q: name='settings.json' and mimeType='application/json' and trashed=false
 */
async function findSettingsFileId(
    drive: drive_v3.Drive,
): Promise<string | null> {
    try {
        const response = await drive.files.list({
            spaces: "appDataFolder",
            q: `name='${SETTINGS_FILENAME}' and mimeType='${SETTINGS_MIME}' and trashed=false`,
            fields: "files(id)",
            pageSize: 10,
        });

        const files = response.data.files ?? [];
        if (files.length > 0 && files[0].id) {
            return files[0].id;
        }
        return null;
    } catch (err) {
        const error = err as Error;
        throw new Error(
            `findSettingsFileId: failed to query appDataFolder: ${error.message}`,
        );
    }
}

/**
 * upsertAppDataSettings()
 *
 * Create-or-update the settings.json in the appDataFolder. If the file exists,
 * overwrite its contents; otherwise create it inside appDataFolder.
 *
 * - Uses MIME type "application/json".
 * - Streams the JSON string content.
 * - Returns: { fileId, created }
 */
export async function upsertAppDataSettings(
    accessToken: string,
    data: Partial<AppSettings>,
): Promise<{ fileId: string; created: boolean; data: AppSettings }> {
    const drive = getDriveClientFromAccessToken(accessToken);

    // Serialize and prepare a stream for upload to Drive
    const payload = createSettingsPayload(data);
    const json = JSON.stringify(payload);
    // Prepare separate media objects typed for create and update to satisfy TS
    const mediaForCreate: drive_v3.Params$Resource$Files$Create["media"] = {
        mimeType: SETTINGS_MIME,
        body: Readable.from(Buffer.from(json, "utf8")),
    };
    const mediaForUpdate: drive_v3.Params$Resource$Files$Update["media"] = {
        mimeType: SETTINGS_MIME,
        body: Readable.from(Buffer.from(json, "utf8")),
    };

    try {
        const existingId = await findSettingsFileId(drive);

        if (existingId) {
            // Overwrite existing file content via files.update
            const updateRes = await drive.files.update({
                fileId: existingId,
                media: mediaForUpdate,
                requestBody: {
                    // keep a stable name and MIME type
                    name: SETTINGS_FILENAME,
                    mimeType: SETTINGS_MIME,
                },
                fields: "id",
            });

            const fileId = updateRes.data.id;
            if (!fileId) {
                throw new Error("Drive update did not return a file id");
            }
            return { fileId, created: false, data: payload };
        }

        // Create new settings.json in appDataFolder
        const createRes = await drive.files.create({
            media: mediaForCreate,
            requestBody: {
                name: SETTINGS_FILENAME,
                mimeType: SETTINGS_MIME,
                parents: ["appDataFolder"],
            },
            fields: "id",
        });

        const fileId = createRes.data.id;
        if (!fileId) {
            throw new Error("Drive create did not return a file id");
        }
        return { fileId, created: true, data: payload };
    } catch (err) {
        const error = err as Error;
        throw new Error(
            `upsertAppDataSettings: failed to write settings to appDataFolder: ${error.message}`,
        );
    }
}

/**
 * readAppDataSettings()
 *
 * Read settings.json from the appDataFolder. If not found, return null.
 * Uses files.get with alt="media" to fetch file content bytes, converts to
 * Buffer and parses as JSON. Performs very light normalization/validation,
 * without heavy runtime schema checks.
 *
 * Throws a descriptive error if the read or JSON parsing fails.
 */
export async function readAppDataSettings(
    accessToken: string,
): Promise<AppSettings | null> {
    const drive = getDriveClientFromAccessToken(accessToken);

    const fileId = await findSettingsFileId(drive);
    if (!fileId) {
        return null;
    }

    try {
        // Fetch bytes of the file content
        const res = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "arraybuffer" },
        );

        // Convert to Buffer then parse
        const buffer = Buffer.from(res.data as ArrayBuffer);
        const parsed = JSON.parse(buffer.toString("utf8")) as Record<string, unknown>;

        return normalizeSettings(parsed);
    } catch (err) {
        const error = err as Error;
        // Distinguish parse vs fetch errors by message prefix
        if (error.message.includes("Unexpected token")) {
            throw new Error(`readAppDataSettings: JSON parse failed: ${error.message}`);
        }
        throw new Error(
            `readAppDataSettings: failed to read settings from appDataFolder: ${error.message}`,
        );
    }
}
