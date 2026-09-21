"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/assets/logo.png";

interface MobileTopBarProps {
  pageName: string;
}

export function MobileTopBar({ pageName }: MobileTopBarProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo — actual image */}
        <Link href="/app/trips" className="flex items-center shrink-0">
          <Image className="w-auto h-8" src={Logo} alt="SafarAI" priority />
          <div className="font-bold text-black text-sm">SAFAR AI.</div>
        </Link>
        <h1 className="text-sm font-normal text-muted-foreground">
          {pageName}
        </h1>
        <div className="w-20" />
      </div>
    </div>
  );
}
