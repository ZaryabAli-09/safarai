// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/lib/SessionProviderWrapper";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: process.env.APP_NAME ?? "SafarAI",
  description: "An AI-powered travel planning app for northern Pakistan",
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
      <body className="antialiased">
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
