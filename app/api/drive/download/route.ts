import { z } from "zod";
import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { downloadFileServer } from "@/lib/drive-server";

const querySchema = z.object({
  fileId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = extractToken(authHeader);
  if (!accessToken) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { data, metadata } = await downloadFileServer({
      accessToken,
      fileId: parsed.data.fileId,
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
