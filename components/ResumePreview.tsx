"use client";

import { forwardRef } from "react";
import { type CvData as ResumeData } from "@/lib/cv";

type ResumePreviewProps = {
  resume: ResumeData;
};

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resume }, ref) => {
    return (
      <div ref={ref} className="space-y-6">
        <header className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {resume.name || "Your Name"}
          </h2>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            {resume.title || "Professional Title"}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
            {resume.contact.email && <span>{resume.contact.email}</span>}
            {resume.contact.phone && <span>{resume.contact.phone}</span>}
            {resume.contact.website && (
              <a
                href={resume.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {resume.contact.website}
              </a>
            )}
            {resume.contact.location && <span>{resume.contact.location}</span>}
          </div>
        </header>

        {resume.summary && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Summary
            </h3>
            <div
              className="text-sm leading-relaxed text-slate-700"
              dangerouslySetInnerHTML={{ __html: resume.summary }}
            />
          </section>
        )}

        {resume.experience.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Experience
            </h3>
            <div className="space-y-4">
              {resume.experience.map((item, index) => (
                <article
                  key={`${item.company}-${index}`}
                  className="rounded-lg border border-slate-100 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.role}
                      </p>
                      <p className="text-xs text-slate-500">{item.company}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {item.startDate} —{" "}
                      {item.isCurrent ? "Present" : item.endDate || "Present"}
                    </p>
                  </div>
                  {item.description && (
                    <div
                      className="mt-3 text-sm leading-relaxed text-slate-600"
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Education
            </h3>
            <div className="space-y-4">
              {resume.education.map((item, index) => (
                <article
                  key={`${item.school}-${index}`}
                  className="rounded-lg border border-slate-100 p-4 shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {item.degree}
                  </p>
                  <p className="text-xs text-slate-500">{item.school}</p>
                  <p className="text-xs text-slate-400">
                    {item.startYear} — {item.endYear || "Present"}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {resume.skills.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
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

