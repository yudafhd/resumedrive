import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"
import SkipLink from "@/components/SkipLink";
import Footer from "@/components/Footer";

import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppDataProvider } from "@/components/providers/AppDataProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RESUME DRIVE",
  description:
    "Build and manage your Resum / CV with Google Drive storage powered by Google Identity Services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="id"
      className={`${inter.variable} ${poppins.variable}`}
    >
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        <Script
          src="https://apis.google.com/js/api.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <AppDataProvider>
              <SkipLink />
              {children}
              <Footer />
            </AppDataProvider>
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
