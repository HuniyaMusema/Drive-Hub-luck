import React, { createContext, useContext, useState, useCallback } from "react";
import type { User, UserRole, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default to admin for demo — swap to "lottery_staff" to test
const defaultUser: User = {
  id: "1",
  name: "Admin User",
  email: "admin@drivehub.com",
  role: "admin",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser);

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
