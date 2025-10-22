"use client";

import { CvData } from "@/lib/cv";
import { RichEditor } from "@/components/RichEditor";

type FormEditorProps = {
  value: CvData;
  onChange: (value: CvData) => void;
};

export function FormEditor({ value, onChange }: FormEditorProps) {
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
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </label>
            <input
              type="text"
              value={value.name}
              onChange={(event) => update({ name: event.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              type="text"
              value={value.title}
              onChange={(event) => update({ title: event.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              type="email"
              value={value.contact.email}
              onChange={(event) =>
                update({
                  contact: { ...value.contact, email: event.target.value },
                })
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </label>
              <input
                type="text"
                value={value.contact.phone ?? ""}
                onChange={(event) =>
                  update({
                    contact: { ...value.contact, phone: event.target.value },
                  })
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Website
              </label>
              <input
                type="text"
                value={value.contact.website ?? ""}
                onChange={(event) =>
                  update({
                    contact: { ...value.contact, website: event.target.value },
                  })
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Location
          </label>
          <input
            type="text"
            value={value.contact.location ?? ""}
            onChange={(event) =>
              update({
                contact: { ...value.contact, location: event.target.value },
              })
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Summary
          </label>
          <RichEditor
            value={value.summary}
            onChange={(text) => update({ summary: text })}
            rows={4}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Add role
          </button>
        </div>
        {value.experience.length === 0 ? (
          <p className="text-sm text-slate-500">
            Add your recent roles to showcase your impact.
          </p>
        ) : (
          <div className="space-y-6">
            {value.experience.map((item, index) => (
              <div
                key={`${item.company}-${index}`}
                className="rounded-lg border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Role {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Company
                    </label>
                    <input
                      type="text"
                      value={item.company}
                      onChange={(event) =>
                        updateExperience(index, {
                          company: event.target.value,
                        })
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(event) =>
                        updateExperience(index, { role: event.target.value })
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
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
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  I&apos;m currently in this position
                </label>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={item.startDate}
                      onChange={(event) =>
                        updateExperience(index, { startDate: event.target.value })
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={item.isCurrent ? "Present" : item.endDate ?? ""}
                      disabled={item.isCurrent}
                      onChange={(event) =>
                        updateExperience(index, { endDate: event.target.value })
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </label>
                  <RichEditor
                    value={item.description ?? ""}
                    onChange={(text) =>
                      updateExperience(index, {
                        description: text,
                      })
                    }
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Add school
          </button>
        </div>
        {value.education.length === 0 ? (
          <p className="text-sm text-slate-500">
            Add academic history or certifications.
          </p>
        ) : (
          <div className="space-y-6">
            {value.education.map((item, index) => (
              <div
                key={`${item.school}-${index}`}
                className="rounded-lg border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Entry {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      School
                    </label>
                    <input
                      type="text"
                      value={item.school}
                      onChange={(event) =>
                        updateEducation(index, { school: event.target.value })
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(event) =>
                        updateEducation(index, { degree: event.target.value })
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Start Year
                    </label>
                    <input
                      type="text"
                      value={item.startYear}
                      onChange={(event) =>
                        updateEducation(index, { startYear: event.target.value })
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      End Year
                    </label>
                    <input
                      type="text"
                      value={item.endYear ?? ""}
                      onChange={(event) =>
                        updateEducation(index, { endYear: event.target.value })
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
        <p className="text-sm text-slate-500">
          Separate skills with commas. Example: TypeScript, React, GCP, Figma
        </p>
        <input
          type="text"
          value={skillString}
          onChange={(event) =>
            update({
              skills: event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 "
        />
      </section>
    </div>
  );
}
