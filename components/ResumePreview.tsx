"use client";

import { forwardRef } from "react";
import { type CvData as ResumeData } from "@/lib/cv";
import { useTranslation } from "./providers/LanguageProvider";

type ResumePreviewProps = {
  resume: ResumeData;
};

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resume }, ref) => {
    const { t } = useTranslation();
    return (
      <div ref={ref} className="space-y-6">
        <header className="border-b border-[var(--color-border)] pb-4">
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {resume.name || t("resumePreview.fallbackName")}
          </h2>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {resume.title || t("resumePreview.fallbackTitle")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1 text-sm text-[var(--color-text-muted)]">
            {resume.contact.location && <span>{resume.contact.location} . </span>}
            {resume.contact.email && <span>{resume.contact.email} . </span>}
            {resume.contact.phone && <span>{resume.contact.phone} . </span>}
            {resume.contact.website && (
              <a
                href={resume.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline transition-colors"
              >
                {resume.contact.website}
              </a>
            )}

          </div>
        </header>

        {resume.summary && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("resumePreview.summary")}
            </h3>
            <div
              className="text-sm leading-relaxed text-[var(--color-text-secondary)]"
              dangerouslySetInnerHTML={{ __html: resume.summary }}
            />
          </section>
        )}

        {resume.experience.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("resumePreview.experience")}
            </h3>
            <div className="space-y-4">
              {resume.experience.map((item, index) => (
                <article
                  key={`${item.company}-${index}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {item.role}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{item.company}</p>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {item.startDate} —{" "}
                      {item.isCurrent
                        ? t("resumePreview.present")
                        : item.endDate || t("resumePreview.present")}
                    </p>
                  </div>
                  {item.description && (
                    <div
                      className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {resume.education.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("resumePreview.education")}
            </h3>
            <div className="space-y-4">
              {resume.education.map((item, index) => (
                <article
                  key={`${item.school}-${index}`}
                >
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {item.degree}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.school}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.startYear} — {item.endYear || t("resumePreview.present")}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {resume.skills.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("resumePreview.skills")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="badge border border-[var(--color-primary-light)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  },
);

ResumePreview.displayName = "ResumePreview";
