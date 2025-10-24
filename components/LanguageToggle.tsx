"use client";

import { useTranslation } from "./providers/LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div
      className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-0.5 text-xs shadow-sm"
      role="group"
      aria-label={t("language.switcherLabel")}
    >
      <button
        type="button"
        className={`px-2 py-1 font-semibold transition-colors ${
          language === "id"
            ? "rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        }`}
        onClick={() => setLanguage("id")}
        aria-pressed={language === "id"}
        aria-label={t("language.selectIndonesian")}
      >
        {t("language.indonesianShort")}
      </button>
      <button
        type="button"
        className={`px-2 py-1 font-semibold transition-colors ${
          language === "en"
            ? "rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        }`}
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        aria-label={t("language.selectEnglish")}
      >
        {t("language.englishShort")}
      </button>
    </div>
  );
}

export default LanguageToggle;

