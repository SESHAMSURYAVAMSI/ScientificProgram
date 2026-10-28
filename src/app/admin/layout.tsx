
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth";

// This protected layout needs request-time cookie access.
export const instant = false;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin-login");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/admin-login");
  }

  return <>{children}</>;
}
