
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";

interface RoleGuardProps {
  resource: string;
  action: Parameters<
    ReturnType<typeof usePermission>["can"]
  >[1];
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RoleGuard({
  resource,
  action,
  children,
  fallback = null,
}: RoleGuardProps) {
  const router = useRouter();
  const { can } = usePermission();

  const allowed = can(resource, action);

  useEffect(() => {
    if (!allowed && fallback === null) {
      router.replace("/unauthorized");
    }
  }, [allowed, fallback, router]);

  if (!allowed) {
    return fallback;
  }

  return children;
}
