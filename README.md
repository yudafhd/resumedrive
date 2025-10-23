# ResumeDrive

ResumeDrive is a Next.js (App Router) starter that helps you build a Google-integrated CV editor. Users sign in with Google Identity Services, open Google Picker to choose folders or existing resumes, then read and sync CV data as JSON to their own Drive. The app only requests the `drive.file` scope so it can create/update files that belong to the app or files explicitly picked by the user.

## Features

- Google Identity Services popup sign-in; access token stored client-side only.
- Google Picker for selecting target folders or existing JSON files.
- Client helpers for Google Drive REST (list, download, create/update) with exponential backoff.
- Optional proxy API routes backed by the official `googleapis` SDK.
- CV editor built with Tailwind + TanStack Query.
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
```

> ⚠️ The app requests the `https://www.googleapis.com/auth/drive.file` and `https://www.googleapis.com/auth/drive.appdata` scopes. The latter stores user settings in the private `appDataFolder`; remove it only if you drop that feature.

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

- **Auth & state** – `GoogleSignInButton` initializes GIS popup mode and stores the short-lived access token in memory/localStorage via `AuthProvider`. The token includes `drive.file` and `drive.appdata` scopes.
- **App data** – `lib/drive-server.ts` and `lib/drive-appdata.ts` handle resumes and preferences in Drive's private `appDataFolder`, so content stays invisible in My Drive. `AppDataProvider` exposes upload/list/delete helpers across the UI via the `/api/drive/*` routes.
- **Optional picker** – `PickerButton` remains available if you want to expose Google Picker for regular Drive files, but the default flow no longer depends on it.
- **Drive proxy** – `/api/drive/*` routes cover list/upload/download/delete operations with server-side validation using the `googleapis` SDK (handy when you must hide additional logic).
- **CV editor** – `/cv/editor` uses TanStack Query for Drive fetches and lightweight validation helpers to keep resume data consistent.

## Deployment

The project is Vercel-ready out of the box. Make sure to add the same environment variables from `.env.local` to your Vercel project settings and to whitelist the production origin in your Google Cloud OAuth client and API key restrictions.

## Notes

- No refresh tokens are stored; the client only handles short-lived access tokens returned by GIS.
- Drive files created through the app receive `appProperties.app = "resumedrive"` so list queries stay scoped.
- Rate-limited Drive errors automatically retry with exponential backoff.
- Tailwind CSS 4 is used with the App Router layout/fonts. Update `app/globals.css` to match your branding.

Happy building!
