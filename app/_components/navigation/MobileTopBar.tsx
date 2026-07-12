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
        <Link href="/app/trips" className="flex items-center">
          <Image src={Logo} alt="SafarAI" className="h-7 w-auto" priority />
        </Link>
        <h1 className="text-sm font-normal text-muted-foreground">
          {pageName}
        </h1>
        <div className="w-7" />
      </div>
    </div>
  );
}
