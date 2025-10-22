import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { downloadFileServer } from "@/lib/drive-server";

/** Manual query validation (replaces former Zod schema) */

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = extractToken(authHeader);
  if (!accessToken) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const fileId = request.nextUrl.searchParams.get("fileId");
  if (typeof fileId !== "string" || fileId.trim().length === 0) {
    return NextResponse.json({ error: "fileId must be a non-empty string" }, { status: 400 });
  }

  try {
    const { data, metadata } = await downloadFileServer({
      accessToken,
      fileId,
    });
    const base64 = Buffer.from(data).toString("base64");
    return NextResponse.json({
      metadata,
      data: base64,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Download failed",
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
