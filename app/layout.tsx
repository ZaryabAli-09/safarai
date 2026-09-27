// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/lib/SessionProviderWrapper";
import { JsonLd } from "@/app/_components/seo/JsonLd";
import {
  ICONS,
  OG_IMAGE,
  PAGE_SEO,
  PWA_THEME_COLOR,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/seo.config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
  weight: "600",
});

export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
};

/**
 * Site-wide defaults. Per-page title/description/OG/Twitter data lives in
 * `seo.config.ts` and each page spreads it in with `buildMetadata()`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: PAGE_SEO.home.absoluteTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: PAGE_SEO.home.description,
  keywords: PAGE_SEO.home.keywords,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: PAGE_SEO.home.absoluteTitle,
    description: PAGE_SEO.home.description,
    images: [
      {
        url: OG_IMAGE.url,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO.home.absoluteTitle,
    description: PAGE_SEO.home.description,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: ICONS.ico, sizes: "any" },
      { url: ICONS.png, type: "image/png", sizes: "96x96" },
      { url: ICONS.icon192, type: "image/png", sizes: "192x192" },
      { url: ICONS.icon512, type: "image/png", sizes: "512x512" },
    ],
    shortcut: [ICONS.ico],
    apple: [{ url: ICONS.apple, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} antialiased`}>
        <JsonLd id="ld-organization" data={organizationJsonLd()} />
        <JsonLd id="ld-website" data={webSiteJsonLd()} />
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <Toaster position="top-center" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
