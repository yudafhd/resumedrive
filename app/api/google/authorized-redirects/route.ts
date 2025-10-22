import { NextRequest, NextResponse } from "next/server";

const DEFAULT_REDIRECT_PATHS = ["/api/google/oauth2callback"];

function parseEnvRedirects() {
  const raw =
    process.env.GOOGLE_AUTH_REDIRECT_PATHS ??
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECTS;

  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildRedirectUrls(origin: string) {
  const configured = parseEnvRedirects();
  const allEntries = [...DEFAULT_REDIRECT_PATHS, ...configured];

  const unique = new Set<string>();
  for (const entry of allEntries) {
    if (!entry) continue;
    if (entry.startsWith("http://") || entry.startsWith("https://")) {
      unique.add(entry);
      continue;
    }
    const url = new URL(entry.startsWith("/") ? entry : `/${entry}`, origin);
    unique.add(url.toString());
  }

  return Array.from(unique);
}

export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const redirects = buildRedirectUrls(origin);

  return NextResponse.json({
    origin,
    authorizedRedirectUris: redirects,
  });
}
