export type AppSettings = {
    theme: "light" | "dark";
    locale: string;
    recentResumeId?: string | null;
    lastUpdatedAt: string;
    [key: string]: unknown;
};

const DEFAULT_THEME: AppSettings["theme"] = "light";
const DEFAULT_LOCALE = "en-US";

export function normalizeSettings(
    input: Record<string, unknown> | null | undefined,
): AppSettings {
    const themeRaw = input?.theme;
    const theme: AppSettings["theme"] =
        themeRaw === "dark" ? "dark" : themeRaw === "light" ? "light" : DEFAULT_THEME;

    const localeRaw = input?.locale;
    const locale =
        typeof localeRaw === "string" && localeRaw.trim().length > 0
            ? localeRaw
            : DEFAULT_LOCALE;

    const recentResumeId =
        typeof input?.recentResumeId === "string" && input.recentResumeId.trim()
            ? input.recentResumeId
            : null;

    const lastUpdatedAtRaw = input?.lastUpdatedAt;
    const lastUpdatedAt =
        typeof lastUpdatedAtRaw === "string" && lastUpdatedAtRaw
            ? lastUpdatedAtRaw
            : new Date().toISOString();

    return {
        ...(input ?? {}),
        theme,
        locale,
        recentResumeId,
        lastUpdatedAt,
    };
}

export function createSettingsPayload(
    partial: Partial<AppSettings> | null | undefined,
): AppSettings {
    const base = normalizeSettings(partial ?? {});
    return {
        ...base,
        lastUpdatedAt: new Date().toISOString(),
    };
}
