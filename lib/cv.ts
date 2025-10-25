import { createSafeParser, err, ok, type ParseResult, isStringArray } from "@/lib/validate";

/**
 * Types replacing former Zod schemas. Matches the previous data shape exactly.
 */
export type Experience = {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrent?: boolean; // normalized to boolean in normalizeCv
};

export type Education = {
  school: string;
  degree: string;
  startYear: string;
  endYear?: string;
};

export type CustomSectionEntry = {
  title: string;
  description?: string;
};

export type CustomSection = {
  heading: string;
  entries: CustomSectionEntry[];
};

export type Contact = {
  email: string; // previously z.string().email(...)
  phone?: string;
  website?: string;
  location?: string;
};

export type CvData = {
  name: string;
  title: string;
  contact: Contact;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  customSections: CustomSection[];
};

/**
 * Defaults preserved from the previous file.
 */
export const defaultCv: CvData = {
  name: "",
  title: "",
  contact: {
    email: "",
    phone: "",
    website: "",
    location: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  customSections: [],
};

/**
 * Runtime type guards
 */
function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function nonEmptyString(v: unknown): v is string {
  return isString(v) && v.length > 0;
}

function isEmailLike(v: unknown): v is string {
  if (!isString(v)) return false;
  // Simple email check consistent with common expectations
  // (Zod email was previously used; this is a lightweight approximation)
  return v === "" || /\S+@\S+\.\S+/.test(v);
}

function isExperience(u: unknown): u is Experience {
  if (typeof u !== "object" || u === null) return false;
  const e = u as Record<string, unknown>;
  if (!nonEmptyString(e.company)) return false;
  if (!nonEmptyString(e.role)) return false;
  if (!nonEmptyString(e.startDate)) return false;
  if (e.endDate !== undefined && !isString(e.endDate)) return false;
  if (e.description !== undefined && !isString(e.description)) return false;
  if (e.isCurrent !== undefined && !isBool(e.isCurrent)) return false;
  return true;
}

function isEducation(u: unknown): u is Education {
  if (typeof u !== "object" || u === null) return false;
  const e = u as Record<string, unknown>;
  if (!nonEmptyString(e.school)) return false;
  if (!nonEmptyString(e.degree)) return false;
  if (!nonEmptyString(e.startYear)) return false;
  if (e.endYear !== undefined && !isString(e.endYear)) return false;
  return true;
}

function isCustomSectionEntry(u: unknown): u is CustomSectionEntry {
  if (typeof u !== "object" || u === null) return false;
  const entry = u as Record<string, unknown>;
  if (!isString(entry.title)) return false;
  if (entry.description !== undefined && !isString(entry.description)) return false;
  return true;
}

function isCustomSection(u: unknown): u is CustomSection {
  if (typeof u !== "object" || u === null) return false;
  const section = u as Record<string, unknown>;
  if (!isString(section.heading)) return false;
  if (!Array.isArray(section.entries) || !section.entries.every(isCustomSectionEntry)) {
    return false;
  }
  return true;
}

function isContact(u: unknown): u is Contact {
  if (typeof u !== "object" || u === null) return false;
  const c = u as Record<string, unknown>;
  if (!isEmailLike(c.email)) return false;
  if (c.phone !== undefined && !isString(c.phone)) return false;
  if (c.website !== undefined && !isString(c.website)) return false;
  if (c.location !== undefined && !isString(c.location)) return false;
  return true;
}

function isExperienceArray(u: unknown): u is Experience[] {
  return Array.isArray(u) && u.every(isExperience);
}

function isEducationArray(u: unknown): u is Education[] {
  return Array.isArray(u) && u.every(isEducation);
}

function isCvData(u: unknown): u is CvData {
  if (typeof u !== "object" || u === null) return false;
  const v = u as Record<string, unknown>;

  if (!nonEmptyString(v.name)) return false;
  if (v.title !== undefined && !isString(v.title)) return false;

  if (!isContact(v.contact)) return false;

  if (v.summary !== undefined && !isString(v.summary)) return false;

  if (v.experience !== undefined && !isExperienceArray(v.experience)) return false;
  if (v.education !== undefined && !isEducationArray(v.education)) return false;
  if (v.skills !== undefined && !isStringArray(v.skills)) return false;
  if (v.customSections !== undefined) {
    if (!Array.isArray(v.customSections) || !v.customSections.every(isCustomSection)) {
      return false;
    }
  }

  return true;
}

/**
 * Normalization to apply defaults that the old Zod schema provided.
 */
function normalizeCv(input: CvData): CvData {
  const exp: Experience[] = Array.isArray(input.experience) ? input.experience.map((e) => ({
    company: e.company ?? "",
    role: e.role ?? "",
    startDate: e.startDate ?? "",
    endDate: e.endDate,
    description: e.description,
    isCurrent: e.isCurrent ?? false,
  })) : [];

  const edu: Education[] = Array.isArray(input.education) ? input.education.map((e) => ({
    school: e.school ?? "",
    degree: e.degree ?? "",
    startYear: e.startYear ?? "",
    endYear: e.endYear,
  })) : [];

  const contact: Contact = {
    email: isString(input.contact?.email) ? input.contact.email : "",
    phone: isString(input.contact?.phone) ? input.contact.phone : undefined,
    website: isString(input.contact?.website) ? input.contact.website : undefined,
    location: isString(input.contact?.location) ? input.contact.location : undefined,
  };

  const customSections: CustomSection[] = Array.isArray(input.customSections)
    ? input.customSections
        .filter(isCustomSection)
        .map((section) => ({
          heading: section.heading ?? "",
          entries: Array.isArray(section.entries)
            ? section.entries
                .filter(isCustomSectionEntry)
                .map((entry) => ({
                  title: entry.title ?? "",
                  description: isString(entry.description) ? entry.description : "",
                }))
            : [],
        }))
    : [];

  return {
    name: input.name ?? "",
    title: isString(input.title) ? input.title : "",
    contact,
    summary: isString(input.summary) ? input.summary : "",
    experience: exp,
    education: edu,
    skills: Array.isArray(input.skills) ? input.skills.filter((s): s is string => typeof s === "string") : [],
    customSections,
  };
}

/**
 * Parsing helpers
 */
export function parseCv(u: unknown): ParseResult<CvData> {
  // Delegate to a safe parser over the type guard with normalization
  const parser = createSafeParser<CvData>(isCvData, normalizeCv);
  const res = parser(u);
  if (!res.ok) return err("Invalid CV data");
  return ok(res.data);
}

/**
 * cvSchema-compatible surface with parse() and safeParse()
 * to minimize downstream churn.
 */
export const cvSchema = {
  parse(u: unknown): CvData {
    const r = parseCv(u);
    if (!r.ok) throw new Error(r.error);
    return r.data;
  },
  safeParse(u: unknown):
    | { success: true; data: CvData }
    | { success: false; error: { message: string } } {
    const r = parseCv(u);
    return r.ok ? { success: true, data: r.data } : { success: false, error: { message: r.error } };
  },
};
