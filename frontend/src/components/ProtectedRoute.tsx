import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/auth";
import NotAuthorized from "@/pages/NotAuthorized";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!hasPermission(allowedRoles)) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
