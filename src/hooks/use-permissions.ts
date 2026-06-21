"use client";

import { useAuth } from "./use-auth";

export function usePermissions() {
  const { user, isLoading } = useAuth();

  const can = (module: string, action: string): boolean => {
    if (!user) return false;
    if (user.role.name === "SUPERADMIN") return true;
    return user.permissions.includes(`${module}:${action}`);
  };

  return { can, isLoading, role: user?.role.name };
}
