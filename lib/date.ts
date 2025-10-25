export function resolveLocale(language?: string) {
  if (!language) return "en-US";
  if (language === "id") return "id-ID";
  if (language === "en") return "en-US";
  return language;
}

export function normalizeDateForInput(value?: string | null): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return "";
}

export function formatDisplayDate(
  value?: string | null,
  language?: string,
  options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" },
): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const normalized = normalizeDateForInput(trimmed) || trimmed;
  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) {
    const locale = resolveLocale(language);
    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch {
      return date.toLocaleDateString(undefined, options);
    }
  }

  return trimmed;
}
