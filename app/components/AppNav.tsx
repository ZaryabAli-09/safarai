"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { RiLogoutCircleLine } from "react-icons/ri";
import { IoBagHandleSharp } from "react-icons/io5";
import { FaUser } from "react-icons/fa6";
import { usePathname } from "next/navigation";

export function AppNav() {
  const pathname = usePathname();

  const activePathname = pathname.split("/")[2];

  return (
    <div className=" bg-white flex px-20 pt-4 pb-6 justify-between items-center fixed -bottom-3 w-full md:px-40 lg:px-80 rounded-2xl border border-gray-200 ">
      {/* first  */}
      <button
        onClick={() => signOut()}
        className="flex flex-col items-center justify-center cursor-pointer hover:text-blue-500"
      >
        <RiLogoutCircleLine className="text-xl md:text-2xl lg:text-3xl hover:text-red-500 text-gray-600" />
        <p className="text-xs md:text-sm lg:text-md text-gray-600">Exit</p>
      </button>

      {/* second  */}
      <Link
        href={"/app/trips"}
        className={`${
          activePathname == "trips" ? "text-blue-500" : "text-gray-600"
        } flex flex-col items-center justify-center  `}
      >
        <IoBagHandleSharp className="text-xl md:text-2xl lg:text-3xl" />
        <p className="text-xs md:text-sm lg:text-md">Trips</p>
      </Link>

      {/* third  */}

      <Link
        href={"/app/profile"}
        className={`${
          activePathname == "profile" ? "text-blue-500" : "text-gray-600"
        } flex flex-col items-center justify-center`}
      >
        <FaUser className="text-xl md:text-2xl lg:text-3xl" />
        <p className="text-xs md:text-sm lg:text-md"> Profile</p>{" "}
      </Link>
    </div>
  );
}
