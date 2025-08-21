// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  console.log("Path:", pathname);
  console.log("Token exists:", !!token);
  console.log("User role:", token?.role);

  // No token → redirect to login
  if (
    !token &&
    (pathname.startsWith("/admin") || pathname.startsWith("/app"))
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Admin routes → only allow role=admin
  if (pathname.startsWith("/admin")) {
    if (token?.role !== "admin") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // User routes → only allow logged in users
  if (pathname.startsWith("/app")) {
    if (token?.role !== "user") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/app/:path*"], // Protect all /admin/* and /user/* routes
};
