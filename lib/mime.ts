export const MIME_JSON =
  process.env.DRIVE_ALLOWED_MIME_JSON ?? "application/json";

export const ALLOWED_MIME_TYPES = [MIME_JSON];

export function isAllowedMime(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return ALLOWED_MIME_TYPES.includes(mimeType);
}
