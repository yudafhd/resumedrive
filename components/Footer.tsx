"use client";

import Link from "next/link";
import { useTranslation } from "./providers/LanguageProvider";

const currentYear = new Date().getFullYear();

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {t("footer.copyright", { year: currentYear })}
        </p>
        <nav aria-label={t("footer.navigationLabel")} className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/contact"
            className="rounded-[var(--radius-sm)] px-1 py-0.5 transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)]"
          >
            {t("footer.contact")}
          </Link>
          <a
            href="https://github.com/yudafhd/resumedrive"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--radius-sm)] px-1 py-0.5 transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)]"
          >
            {t("footer.github")}
          </a>
          <a
            href="https://yudafhd.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--radius-sm)] px-1 py-0.5 transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)]"
          >
            {t("footer.portfolio")}
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
