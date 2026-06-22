// app/layout.tsx
import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/lib/SessionProviderWrapper";
export const metadata: Metadata = {
  title: process.env.APP_NAME,
  description: "A AI-powered travel planning app for northern Pakistan",
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
      </body>
    </html>
  );
}
