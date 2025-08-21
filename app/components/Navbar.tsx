import Logo from "@/public/assets/logo.png";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="flex items-center justify-between p-2 px-4 md:px-20 bg-gray-100">
      <div className="">
        <Image className="w-35 h-15 md:w-45 md:h-20" src={Logo} alt="Logo" />{" "}
      </div>
      <div className="">
        <button
          type="button"
          className="p-3 text-sm sm:p-4 sm:text-md md:text-xl font-bold text-white rounded-lg  bg-blue-600 cursor-pointer hover:bg-blue-500 ease-in "
        >
          <Link href={""}> Plan Your Trip Now</Link>
        </button>
      </div>
    </div>
  );
}
