import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { uploadFileServer } from "@/lib/drive-server";
import { isAllowedMime } from "@/lib/mime";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = extractToken(authHeader);
  if (!accessToken) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const body = await request.json();

  // name: non-empty string
  if (typeof body?.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
  }

  // mimeType: string and allowed
  if (typeof body?.mimeType !== "string" || !isAllowedMime(body.mimeType)) {
    return NextResponse.json({ error: "Unsupported MIME type" }, { status: 415 });
  }

  // data: non-empty string
  if (typeof body?.data !== "string" || body.data.length === 0) {
    return NextResponse.json({ error: "data must be a non-empty string" }, { status: 400 });
  }

  // encoding: one of base64 | utf8 (default base64)
  let encoding: "base64" | "utf8" = "base64";
  if (body.encoding !== undefined) {
    if (body.encoding === "base64" || body.encoding === "utf8") {
      encoding = body.encoding;
    } else {
      return NextResponse.json(
        { error: "encoding must be one of base64 or utf8" },
        { status: 400 },
      );
    }
  }

  // fileId: if present must be a string
  let fileId: string | undefined = undefined;
  if (body.fileId !== undefined) {
    if (typeof body.fileId !== "string") {
      return NextResponse.json({ error: "fileId must be a string" }, { status: 400 });
    }
    fileId = body.fileId as string;
  }

  const buffer = encoding === "utf8"
    ? Buffer.from(body.data, "utf8")
    : Buffer.from(body.data, "base64");

  try {
    const file = await uploadFileServer({
      accessToken,
      name: body.name as string,
      mimeType: body.mimeType as string,
      data: buffer,
      fileId,
    });
    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Drive upload failed",
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
