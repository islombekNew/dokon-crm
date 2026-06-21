"use client";

import { useState, useEffect } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: { id: string; name: string };
  branch?: { id: string; name: string } | null;
  permissions: string[];
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setUser(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const hasPermission = (module: string, action: string) => {
    return user?.permissions.includes(`${module}:${action}`) ?? false;
  };

  return { user, isLoading, hasPermission };
}
