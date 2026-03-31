import React, { createContext, useContext, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User, UserRole, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always start unauthenticated on fresh app load — no auto-restore from localStorage.
  // The JWT token is kept in localStorage only for API calls made during the active session.
  const [user, setUser] = useState<User | null>(null);

  const queryClient = useQueryClient();

  // Clear any stale saved user from a previous session on initial mount
  React.useEffect(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    queryClient.clear();
  }, [user, queryClient]);

  const hasPermission = useCallback(
    (allowedRoles: UserRole[]) => {
      if (!user) return false;
      return allowedRoles.includes(user.role);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, setUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
