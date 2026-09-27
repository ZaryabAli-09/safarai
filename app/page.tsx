import type { Metadata } from "next";

import LandingPage from "@/app/_components/landing/LandingPage";
import { Navbar } from "@/app/_components/navigation/Navbar";
import { JsonLd } from "@/app/_components/seo/JsonLd";
import { buildMetadata, softwareApplicationJsonLd } from "@/seo.config";

export const metadata: Metadata = buildMetadata("home");

export default function App() {
  return (
    <>
      <JsonLd id="ld-software" data={softwareApplicationJsonLd()} />
      <Navbar />
      <LandingPage />
    </>
  );
}
