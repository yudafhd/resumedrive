# ResumeDrive

ResumeDrive is a Next.js (App Router) starter that helps you build a Google-integrated CV editor. Users sign in with Google Identity Services, open Google Picker to choose folders or existing resumes, then read and sync CV data as JSON/XLSX to their own Drive. The app only requests the `drive.file` scope so it can create/update files that belong to the app or files explicitly picked by the user.

## Features

- Google Identity Services popup sign-in; access token stored client-side only.
- Google Picker for selecting target folders or existing JSON/XLSX files.
- Client helpers for Google Drive REST (list, download, create/update) with exponential backoff.
- Optional proxy API routes backed by the official `googleapis` SDK.
- CV editor built with Tailwind + TanStack Query that converts JSON ↔ XLSX using SheetJS.
- Friendly tooling for drafts, rapid folder/file recall, and Drive-aware metadata (`appProperties`).

## Prerequisites

1. **Google Cloud project** with the following APIs enabled:
   - Google Drive API
   - Google Picker API
2. **OAuth client (Web application)** configured with your local development origin (e.g. `http://localhost:3000`). Copy the *Client ID* for GIS.
3. **API key** with Google Picker enabled. Restrict the key to the same HTTP origins.
4. Node 18.18+ (or 20+) and pnpm (recommended) installed locally.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=your_browser_api_key
DRIVE_ALLOWED_MIME_JSON=application/json
DRIVE_ALLOWED_MIME_XLSX=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

> ⚠️ Keep the OAuth scope limited to `https://www.googleapis.com/auth/drive.file`. Only add `drive.appdata` if you plan to use `appDataFolder` uploads.

## Development

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

### Useful scripts

```bash
pnpm dev      # start Next.js with Turbopack
pnpm build    # production build
pnpm start    # serve the production build
pnpm lint     # run eslint
```

## How it works

- **Auth & state** – `GoogleSignInButton` initializes GIS popup mode and stores the short-lived access token in memory/localStorage via `AuthProvider`.
- **Picker** – `PickerButton` loads `gapi` and opens Google Picker with MIME filters (JSON/XLSX) so users choose folders or files.
- **Drive REST** – `lib/drive-client.ts` performs `multipart` uploads, downloads, and listings directly against Drive using the Bearer token.
- **Drive proxy** – `/api/drive/*` routes forward operations with server-side validation using the `googleapis` SDK (handy when you must hide additional logic).
- **CV editor** – `/cv/editor` uses TanStack Query for Drive fetches, SheetJS for XLSX conversions, and Zod validation to keep resume data consistent.

## Deployment

The project is Vercel-ready out of the box. Make sure to add the same environment variables from `.env.local` to your Vercel project settings and to whitelist the production origin in your Google Cloud OAuth client and API key restrictions.

## Notes

- No refresh tokens are stored; the client only handles short-lived access tokens returned by GIS.
- Drive files created through the app receive `appProperties.app = "resumedrive"` so list queries stay scoped.
- Rate-limited Drive errors automatically retry with exponential backoff.
- Tailwind CSS 4 is used with the App Router layout/fonts. Update `app/globals.css` to match your branding.

Happy building!
