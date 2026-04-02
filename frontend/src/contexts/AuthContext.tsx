import React, { createContext, useContext, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User, UserRole, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always start unauthenticated on fresh app load — no auto-restore from persistent storage.
  // The JWT token is kept in sessionStorage only for API calls made during the active tab session.
  // Start authenticated if the user exists in sessionStorage for this tab
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
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
