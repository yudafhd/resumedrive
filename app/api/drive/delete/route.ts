import { NextRequest, NextResponse } from "next/server";
import { deleteFileServer } from "@/lib/drive-server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = extractToken(authHeader);
  if (!accessToken) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || typeof (body as { fileId?: unknown }).fileId !== "string") {
    return NextResponse.json({ error: "fileId must be provided as a string" }, { status: 400 });
  }

  const fileId = (body as { fileId: string }).fileId.trim();
  if (!fileId) {
    return NextResponse.json({ error: "fileId must be a non-empty string" }, { status: 400 });
  }

  try {
    await deleteFileServer({ accessToken, fileId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete file",
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
