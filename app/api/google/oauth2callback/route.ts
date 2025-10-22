import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    message:
      "Google OAuth2 callback reached. This endpoint is intended for configuring Authorized redirect URIs.",
  });
}
