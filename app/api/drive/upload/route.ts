import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { uploadFileServer } from "@/lib/drive-server";
import { ALLOWED_MIME_TYPES } from "@/lib/mime";

const bodySchema = z.object({
  name: z.string().min(1),
  mimeType: z.string().refine((value) => ALLOWED_MIME_TYPES.includes(value), {
    message: "Unsupported MIME type",
  }),
  data: z.string().min(1),
  encoding: z.enum(["base64", "utf8"]).default("base64"),
  parents: z.array(z.string()).optional(),
  fileId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = extractToken(authHeader);
  if (!accessToken) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const buffer =
    payload.encoding === "utf8"
      ? Buffer.from(payload.data, "utf8")
      : Buffer.from(payload.data, "base64");

  try {
    const file = await uploadFileServer({
      accessToken,
      name: payload.name,
      mimeType: payload.mimeType,
      data: buffer,
      parents: payload.parents,
      fileId: payload.fileId,
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
