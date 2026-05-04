/**
 * Layout for public/auth routes
 * No authentication required
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
