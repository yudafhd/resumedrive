import { NextRequest, NextResponse } from "next/server";
import { listFilesServer } from "@/lib/drive-server";
import { ALLOWED_MIME_TYPES } from "@/lib/mime";

// Manual validation replaces former Zod schema

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = extractToken(authHeader);
  if (!accessToken) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;

  const folderId = sp.get("folderId") || undefined;

  let pageSize: number | undefined;
  const pageSizeRaw = sp.get("pageSize");
  if (pageSizeRaw != null) {
    const n = Number.parseInt(pageSizeRaw, 10);
    if (!Number.isFinite(n) || Number.isNaN(n) || n < 1 || n > 100) {
      return NextResponse.json(
        { error: "pageSize must be a number between 1 and 100" },
        { status: 400 },
      );
    }
    pageSize = n;
  }

  const mimeTypesParam = sp.get("mimeTypes");
  const allMimeTypes = mimeTypesParam
    ? mimeTypesParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const filtered = allMimeTypes?.filter((m) => ALLOWED_MIME_TYPES.includes(m));
  const mimeTypes = filtered && filtered.length ? filtered : undefined;

  try {
    const files = await listFilesServer({
      accessToken,
      folderId,
      pageSize,
      mimeTypes,
    });
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to list files",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function extractToken(header: string | null) {
  if (!header) return null;
  const [scheme, value] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !value) {
    return null;
  }
  return value;
}
