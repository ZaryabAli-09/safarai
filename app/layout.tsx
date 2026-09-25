// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/lib/SessionProviderWrapper";

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
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "SafarAI | Plan your next trip in under a minute",
    template: "%s | SafarAI",
  },
  description:
    "SafarAI turns a few travel preferences into a complete, editable itinerary in seconds.",
  keywords: [
    "AI trip planner",
    "travel itinerary planner",
    "vacation planning",
    "travel planning app",
  ],
  authors: [{ name: "SafarAI" }],
  creator: "SafarAI",
  openGraph: {
    type: "website",
    title: "SafarAI | Plan your next trip in under a minute",
    description: "Create a complete, editable travel itinerary with SafarAI.",
    siteName: "SafarAI",
  },
  twitter: {
    card: "summary",
    title: "SafarAI | Plan your next trip in under a minute",
    description: "Create a complete, editable travel itinerary with SafarAI.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon-v2.ico",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SafarAI",
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
