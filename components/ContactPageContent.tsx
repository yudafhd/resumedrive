"use client";

import Link from "next/link";
import { useTranslation } from "./providers/LanguageProvider";

export function ContactPageContent() {
  const { t } = useTranslation();
  const intro = t("contactPage.intro");

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 sm:py-16 md:px-6">
      <section className="space-y-6 rounded-3xl border border-[var(--color-border)] bg-white/90 p-6 shadow-sm sm:p-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Resume Drive
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
            {t("contactPage.title")}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{intro}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {t("contactPage.emailLabel")}
            </h2>
            <a
              href={`mailto:${t("contactPage.emailValue")}`}
              className="text-lg font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              {t("contactPage.emailValue")}
            </a>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t("contactPage.responseTime")}
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/80 p-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                {t("contactPage.githubLabel")}
              </h2>
              <a
                href="https://github.com/yudafhd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
              >
                github.com/yudafhd
              </a>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                {t("contactPage.portfolioLabel")}
              </h2>
              <a
                href="https://yudafhd.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
              >
                yudafhd.github.io
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {t("footer.contact")}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {intro}{" "}
            <Link href="/" className="text-[var(--color-primary)] underline-offset-4 hover:underline">
              Home
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ContactPageContent;
