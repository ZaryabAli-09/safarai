/**
 * Layout for authentication pages (sign-in, register, password reset)
 * These routes are publicly accessible
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
