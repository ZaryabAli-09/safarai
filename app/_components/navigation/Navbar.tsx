import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="flex items-center justify-between p-2 px-4 md:px-20 bg-background border-b border-border/50">
      <div className="">
        <Link href={"/"}>
          {" "}
          <Image
            className="w-35 h-15 md:w-45 md:h-20"
            src={Logo}
            alt="Logo"
          />{" "}
        </Link>
      </div>
      <div className="">
        <Button asChild size="lg" className="font-bold">
          <Link href="/app">Plan Your Trip Now</Link>
        </Button>
      </div>
    </div>
  );
}
