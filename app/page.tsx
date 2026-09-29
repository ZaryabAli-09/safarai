import type { Metadata } from "next";

import LandingPage from "@/app/_components/landing/LandingPage";
import { Navbar } from "@/app/_components/navigation/Navbar";
import { JsonLd } from "@/app/_components/seo/JsonLd";
import { buildMetadata, softwareApplicationJsonLd } from "@/seo.config";

export const metadata: Metadata = buildMetadata("home");

export default function App() {
  /**
   * Read server side and pass down: the landing page is a client component,
   * so only NEXT_PUBLIC_* env vars would otherwise be available to it.
   * `COMPANY_EMAIL` is the public contact address shown in the contact
   * section, FAQ and footer mailto links.
   */
  const companyEmail =
    process.env.COMPANY_EMAIL ?? process.env.GMAIL_SMTP_EMAIL ?? "";

  return (
    <>
      <JsonLd id="ld-software" data={softwareApplicationJsonLd()} />
      <Navbar />
      <LandingPage companyEmail={companyEmail} />
    </>
  );
}
