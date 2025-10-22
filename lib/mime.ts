export const MIME_JSON =
  process.env.DRIVE_ALLOWED_MIME_JSON ?? "application/json";
export const MIME_XLSX =
  process.env.DRIVE_ALLOWED_MIME_XLSX ??
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const ALLOWED_MIME_TYPES = [MIME_JSON, MIME_XLSX];

export function isAllowedMime(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export const PICKER_DOCS_VIEW = {
  docs: ["application/vnd.google-apps.spreadsheet", MIME_XLSX],
  json: [MIME_JSON],
};
