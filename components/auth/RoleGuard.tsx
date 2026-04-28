import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("STUDENT" | "MENTOR" | "ADMIN")[];
  redirectTo?: string;
}

export default async function RoleGuard({
  children,
  allowedRoles,
  redirectTo,
}: RoleGuardProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect wrong-role access to their own dashboard
    if (user.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else if (user.role === "MENTOR") {
      redirect("/admin/courses");
    } else {
      redirect("/dashboard");
    }
  }

  return <>{children}</>;
}
