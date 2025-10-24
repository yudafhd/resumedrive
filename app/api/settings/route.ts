/**
 * Next.js API route for reading and writing user settings in Google Drive's appDataFolder.
 *
 * Requirements:
 * - OAuth2 access token with scope: https://www.googleapis.com/auth/drive.appdata
 * - Stored file name: "settings.json"
 * - MIME type: "application/json"
 *
 * Handlers:
 * - GET:  Reads and returns { data: SettingsData | null }
 * - POST: Upserts settings.json with provided SettingsData, returns { fileId, created }
 *
 * Authorization:
 * - Provide the user's OAuth2 access token in the Authorization header:
 *   Authorization: Bearer <ACCESS_TOKEN>
 *
 * curl examples:
 *
 *   # Read settings (GET)
 *   curl -sS -X GET "http://localhost:3796/api/settings" \
 *     -H "Authorization: Bearer <ACCESS_TOKEN>"
 *
 *   # Upsert settings (POST)
 *   curl -sS -X POST "http://localhost:3796/api/settings" \
 *     -H "Authorization: Bearer <ACCESS_TOKEN>" \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "locale": "en-US",
 *       "recentResumeId": "abc123",
 *       "lastUpdatedAt": "2025-01-01T00:00:00.000Z",
 *       "customKey": "any additional extension field"
 *     }'
 */

import { NextRequest, NextResponse } from "next/server";
import {
    readAppDataSettings,
    upsertAppDataSettings,
} from "@/lib/drive-appdata";
import { normalizeSettings } from "@/lib/app-settings";

/**
 * GET
 * - Reads settings.json from Drive appDataFolder.
 * - Returns 200 with { data: SettingsData | null } on success.
 * - Returns 401 if Bearer token is missing/invalid.
 * - Returns 500 with error message if Drive read fails.
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const accessToken = extractToken(authHeader);
    if (!accessToken) {
        return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
    }

    try {
        const data = await readAppDataSettings(accessToken);
        return NextResponse.json({ data: data ? normalizeSettings(data) : null }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to read settings",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

/**
 * POST
 * - Upserts settings.json into Drive appDataFolder by overwriting or creating.
 * - Body is treated as a SettingsData-like object with light defaults.
 * - Returns 200 with { fileId, created } on success.
 * - Returns 401 if Bearer token is missing/invalid.
 * - Returns 400 if body is invalid JSON or not an object.
 * - Returns 500 if Drive write fails.
 */
export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const accessToken = extractToken(authHeader);
    if (!accessToken) {
        return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
        return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
    }

    // Apply very light defaults without heavy runtime validation.
    const payload = normalizeSettings(body as Record<string, unknown>);

    try {
        const { fileId, created, data } = await upsertAppDataSettings(accessToken, payload);
        return NextResponse.json({ fileId, created, data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to upsert settings",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

function extractToken(header: string | null) {
    if (!header) return null;
    const [scheme, value] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !value) {
        return null;
    }
    return value;
}
