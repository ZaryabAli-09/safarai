import Image from "next/image";
import ResetPasswordBanner from "@/public/assets/reset-password-banner.jpg";
import { Suspense } from "react";

import Logo from "@/public/assets/logo.png";
import { ResetPasswordForm } from "@/app/_components/forms/reset-password-form";
export default function ResetPassword() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center items-center md:justify-start">
          <Image className="w-20" src={Logo} alt="Logo" />
          <div
            className="font-bold text-4xl pr-1 bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#fcd14a_10%,#f9a94a_18%,#ef595c_55%,#ef4563_72%,#654c9e_100%)]"
          >
            SAFAR AI.
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center ">
          <div className="w-full max-w-xs rounded-md shadow-inner border border-gray-200  py-10 px-5 ">
            <Suspense fallback={null}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={ResetPasswordBanner}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
