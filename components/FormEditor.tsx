"use client";

import { CvData } from "@/lib/cv";
import { RichEditor } from "@/components/RichEditor";
import { useTranslation } from "./providers/LanguageProvider";

type FormEditorProps = {
  value: CvData;
  onChange: (value: CvData) => void;
};

export function FormEditor({ value, onChange }: FormEditorProps) {
  const { t } = useTranslation();
  const update = (next: Partial<CvData>) => {
    onChange({ ...value, ...next });
  };

  const updateExperience = (
    index: number,
    patch: Partial<CvData["experience"][number]>,
  ) => {
    const next = [...value.experience];
    next[index] = { ...next[index], ...patch };
    update({ experience: next });
  };

  const removeExperience = (index: number) => {
    const next = value.experience.filter((_, idx) => idx !== index);
    update({ experience: next });
  };

  const addExperience = () => {
    update({
      experience: [
        ...value.experience,
        {
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          description: "",
          isCurrent: false,
        },
      ],
    });
  };

  const updateEducation = (
    index: number,
    patch: Partial<CvData["education"][number]>,
  ) => {
    const next = [...value.education];
    next[index] = { ...next[index], ...patch };
    update({ education: next });
  };

  const removeEducation = (index: number) => {
    const next = value.education.filter((_, idx) => idx !== index);
    update({ education: next });
  };

  const addEducation = () => {
    update({
      education: [
        ...value.education,
        {
          school: "",
          degree: "",
          startYear: "",
          endYear: "",
        },
      ],
    });
  };

  const skillString = value.skills.join(", ");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {t("formEditor.profile")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("formEditor.name")}
            </label>
            <input
              type="text"
              value={value.name}
              onChange={(event) => update({ name: event.target.value })}
              className="input"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("formEditor.title")}
            </label>
            <input
              type="text"
              value={value.title}
              onChange={(event) => update({ title: event.target.value })}
              className="input"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("formEditor.email")}
            </label>
            <input
              type="email"
              value={value.contact.email}
              onChange={(event) =>
                update({
                  contact: { ...value.contact, email: event.target.value },
                })
              }
              className="input"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("formEditor.phone")}
            </label>
            <input
              type="text"
              value={value.contact.phone ?? ""}
              onChange={(event) =>
                update({
                  contact: { ...value.contact, phone: event.target.value },
                })
              }
              className="input"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("formEditor.website")}
            </label>
            <input
              type="text"
              value={value.contact.website ?? ""}
              onChange={(event) =>
                update({
                  contact: { ...value.contact, website: event.target.value },
                })
              }
              className="input"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {t("formEditor.location")}
          </label>
          <textarea
            value={value.contact.location ?? ""}
            onChange={(event) =>
              update({
                contact: { ...value.contact, location: event.target.value },
              })
            }
            className="input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {t("formEditor.summary")}
          </label>
          <textarea
            value={value.summary ?? ""}
            onChange={(event) => update({ summary: event.target.value })}
            className="input"
          />
        </div>
      </section >

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {t("formEditor.experience")}
          </h2>
          <button
            type="button"
            onClick={addExperience}
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)] rounded-[var(--radius-sm)]"
          >
            {t("formEditor.addRole")}
          </button>
        </div>
        {value.experience.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("formEditor.emptyExperience")}
          </p>
        ) : (
          <div className="space-y-6">
            {value.experience.map((item, index) => (
              <div
                key={`${item.company}-${index}`}
                className="card"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
                    {t("formEditor.role")} {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-xs font-semibold text-[var(--color-error)] hover:text-[var(--color-accent-red)] transition-colors"
                  >
                    {t("formEditor.removeRole")}
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {t("formEditor.company")}
                    </label>
                    <input
                      type="text"
                      value={item.company}
                      onChange={(event) =>
                        updateExperience(index, {
                          company: event.target.value,
                        })
                      }
                      className="input"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {t("formEditor.role")}
                    </label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(event) =>
                        updateExperience(index, { role: event.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>
                <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={item.isCurrent ?? false}
                    onChange={(event) =>
                      updateExperience(index, { isCurrent: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  {t("formEditor.currentRole")}
                </label>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {t("formEditor.startDate")}
                    </label>
                    <input
                      type="text"
                      value={item.startDate}
                      onChange={(event) =>
                        updateExperience(index, { startDate: event.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {t("formEditor.endDate")}
                    </label>
                    <input
                      type="text"
                      value={item.isCurrent ? t("resumePreview.present") : item.endDate ?? ""}
                      disabled={item.isCurrent}
                      onChange={(event) =>
                        updateExperience(index, { endDate: event.target.value })
                      }
                      className="input disabled:cursor-not-allowed disabled:bg-[var(--color-bg-secondary)] disabled:text-[var(--color-text-muted)]"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {t("formEditor.description")}
                  </label>
                  <RichEditor
                    value={item.description ?? ""}
                    onChange={(text) =>
                      updateExperience(index, {
                        description: text,
                      })
                    }
                    rows={3}
                    placeholder={t("richEditor.placeholder")}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {t("formEditor.education")}
          </h2>
          <button
            type="button"
            onClick={addEducation}
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)] rounded-[var(--radius-sm)]"
          >
            {t("formEditor.addEducation")}
          </button>
        </div>
        {value.education.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("formEditor.emptyEducation")}
          </p>
        ) : (
          <div className="space-y-6">
            {value.education.map((item, index) => (
              <div
                key={`${item.school}-${index}`}
                className="card"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
                    {t("formEditor.education")} {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-xs font-semibold text-[var(--color-error)] hover:text-[var(--color-accent-red)] transition-colors"
                  >
                    {t("formEditor.removeEducation")}
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {t("formEditor.school")}
                    </label>
                    <input
                      type="text"
                      value={item.school}
                      onChange={(event) =>
                        updateEducation(index, { school: event.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {t("formEditor.degree")}
                    </label>
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(event) =>
                        updateEducation(index, { degree: event.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {t("formEditor.startYear")}
                    </label>
                    <input
                      type="text"
                      value={item.startYear}
                      onChange={(event) =>
                        updateEducation(index, { startYear: event.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {t("formEditor.endYear")}
                    </label>
                    <input
                      type="text"
                      value={item.endYear ?? ""}
                      onChange={(event) =>
                        updateEducation(index, { endYear: event.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {t("formEditor.skills")}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t("formEditor.skillsDescription")}
        </p>

        <textarea
          value={skillString}
          onChange={(event) =>
            update({
              skills: event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          className="textarea"
        />
      </section>
    </div >
  );
}
