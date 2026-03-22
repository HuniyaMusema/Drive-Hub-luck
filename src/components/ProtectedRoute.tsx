import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/auth";
import NotAuthorized from "@/pages/NotAuthorized";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(allowedRoles)) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
