import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { listFilesServer } from "@/lib/drive-server";
import { ALLOWED_MIME_TYPES } from "@/lib/mime";

const querySchema = z.object({
  folderId: z.string().optional(),
  pageSize: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => Number.isNaN(value) === false, {
      message: "pageSize must be a number",
    })
    .optional(),
  mimeTypes: z
    .string()
    .transform((value) => value.split(",").filter(Boolean))
    .optional(),
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

  const mimeTypes = parsed.data.mimeTypes?.filter((value) =>
    ALLOWED_MIME_TYPES.includes(value),
  );

  try {
    const files = await listFilesServer({
      accessToken,
      folderId: parsed.data.folderId,
      pageSize: parsed.data.pageSize,
      mimeTypes: mimeTypes && mimeTypes.length ? mimeTypes : undefined,
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
