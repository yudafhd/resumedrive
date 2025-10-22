import { read, utils, write } from "xlsx";
import { CvData, cvSchema, defaultCv } from "./cv";
import { MIME_XLSX } from "./mime";

function htmlToPlain(html: string | undefined | null): string {
  if (!html) return "";
  if (typeof window !== "undefined") {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent ?? "";
  }
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function jsonToXlsx(cv: CvData): Blob {
  const workbook = utils.book_new();

  const profileSheet = utils.aoa_to_sheet([
    ["Name", cv.name ?? ""],
    ["Title", cv.title ?? ""],
    ["Email", cv.contact.email ?? ""],
    ["Phone", cv.contact.phone ?? ""],
    ["Website", cv.contact.website ?? ""],
    ["Location", cv.contact.location ?? ""],
    ["Summary", htmlToPlain(cv.summary ?? "")],
  ]);
  utils.book_append_sheet(workbook, profileSheet, "Profile");

  if (cv.experience.length) {
    const experienceSheet = utils.json_to_sheet(
      cv.experience.map((exp) => ({
        Company: exp.company,
        Role: exp.role,
        Start: exp.startDate,
        End: exp.isCurrent ? "" : exp.endDate ?? "",
        Current: exp.isCurrent ? "Yes" : "No",
        Description: htmlToPlain(exp.description ?? ""),
      })),
    );
    utils.book_append_sheet(workbook, experienceSheet, "Experience");
  }

  if (cv.education.length) {
    const educationSheet = utils.json_to_sheet(
      cv.education.map((edu) => ({
        School: edu.school,
        Degree: edu.degree,
        Start: edu.startYear,
        End: edu.endYear ?? "",
      })),
    );
    utils.book_append_sheet(workbook, educationSheet, "Education");
  }

  if (cv.skills.length) {
    const skillsSheet = utils.aoa_to_sheet([
      ["Skill"],
      ...cv.skills.map((skill) => [skill]),
    ]);
    utils.book_append_sheet(workbook, skillsSheet, "Skills");
  }

  const buffer = write(workbook, {
    type: "array",
    bookType: "xlsx",
  });

  return new Blob([buffer], { type: MIME_XLSX });
}

export async function xlsxToJson(file: Blob): Promise<CvData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = read(arrayBuffer, { type: "array" });

  const sheetNames = new Set(workbook.SheetNames);
  const profile: Record<string, string> = {};
  if (sheetNames.has("Profile")) {
    const rows = utils.sheet_to_json<string[]>(
      workbook.Sheets["Profile"],
      {
        header: 1,
      },
    ) as string[][];
    rows.forEach((row) => {
      if (row.length >= 2) {
        profile[row[0]] = row[1] ?? "";
      }
    });
  }

  const experience = sheetNames.has("Experience")
    ? (utils.sheet_to_json(workbook.Sheets["Experience"]) as Array<
        Record<string, string>
      >).map((row) => ({
        company: row.Company ?? "",
        role: row.Role ?? "",
        startDate: row.Start ?? "",
        endDate:
          (row.End ?? "").trim().toLowerCase() === "present"
            ? ""
            : row.End ?? "",
        description: row.Description ?? "",
        isCurrent: (() => {
          const currentRaw = row.Current ?? row.current ?? "";
          const normalized =
            typeof currentRaw === "string"
              ? currentRaw.trim().toLowerCase()
              : "";
          if (
            normalized === "yes" ||
            normalized === "true" ||
            normalized === "present" ||
            normalized === "y"
          ) {
            return true;
          }
          const endRaw = row.End ?? "";
          return (
            typeof endRaw === "string" &&
            endRaw.trim().toLowerCase() === "present"
          );
        })(),
      }))
    : [];

  const education = sheetNames.has("Education")
    ? (utils.sheet_to_json(workbook.Sheets["Education"]) as Array<
        Record<string, string>
      >).map((row) => ({
        school: row.School ?? "",
        degree: row.Degree ?? "",
        startYear: row.Start ?? "",
        endYear: row.End ?? "",
      }))
    : [];

  const skills = sheetNames.has("Skills")
    ? (utils.sheet_to_json(workbook.Sheets["Skills"], {
        header: 1,
      }) as string[][])
        .slice(1)
        .map((row) => row[0])
        .filter(Boolean)
    : [];

  const candidate: CvData = {
    ...defaultCv,
    name: profile.Name ?? "",
    title: profile.Title ?? "",
    contact: {
      email: profile.Email ?? "",
      phone: profile.Phone ?? "",
      website: profile.Website ?? "",
      location: profile.Location ?? "",
    },
    summary: profile.Summary ?? "",
    experience,
    education,
    skills,
  };

  return cvSchema.parse(candidate);
}
