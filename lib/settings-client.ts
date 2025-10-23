import { fetchJSON } from "./async";
import type { AppSettings } from "./app-settings";
import { normalizeSettings } from "./app-settings";

type SettingsGetResponse = {
    data: Record<string, unknown> | null;
};

type SettingsPostResponse = {
    fileId: string;
    created: boolean;
    data: Record<string, unknown>;
};

const SETTINGS_ENDPOINT = "/api/settings";

export async function fetchAppSettings(
    accessToken: string,
    signal?: AbortSignal,
): Promise<AppSettings | null> {
    const res = await fetchJSON<SettingsGetResponse>(
        SETTINGS_ENDPOINT,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        signal,
    );

    if (!res.data) {
        return null;
    }
    return normalizeSettings(res.data);
}

export async function saveAppSettings(
    accessToken: string,
    data: Partial<AppSettings>,
    signal?: AbortSignal,
): Promise<AppSettings> {
    const res = await fetchJSON<SettingsPostResponse>(
        SETTINGS_ENDPOINT,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        },
        signal,
    );

    return normalizeSettings(res.data);
}
