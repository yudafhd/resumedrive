export type AppSettings = {
    locale: string;
    recentResumeId?: string | null;
    lastUpdatedAt: string;
    [key: string]: unknown;
};

const DEFAULT_LOCALE = "en-US";

export function normalizeSettings(
    input: Record<string, unknown> | null | undefined,
): AppSettings {
    const { theme: _legacyTheme, ...rest } = input ?? {};
    void _legacyTheme;

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
        ...rest,
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
