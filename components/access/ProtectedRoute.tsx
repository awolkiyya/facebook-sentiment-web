"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { usePermission } from "@/hooks/usePermission";
import type { RootState } from "@/lib/store/store";
import { PermissionAction } from "@/types/user";

/* =====================================================
   PROTECTED ROUTE PROPS
===================================================== */

interface ProtectedRouteProps {
  children: ReactNode;

  /**
   * Resource that the authenticated user must have access to.
   *
   * Example:
   *
   * resource="facebook_pages"
   */
  resource?: string;

  /**
   * Action required for the resource.
   *
   * Example:
   *
   * action="view"
   */
  action?: PermissionAction;
}

/* =====================================================
   PROTECTED ROUTE
===================================================== */

/**
 * Protects pages/components using authentication
 * and permission-based authorization.
 *
 * IMPORTANT:
 *
 * Roles are intentionally NOT used here.
 *
 * Backend:
 *
 *   Role
 *     ↓
 *   Permissions
 *     ↓
 *   Authenticated User
 *     ↓
 *   Frontend
 *
 * Frontend authorization:
 *
 *   can(resource, action)
 *
 * Backend authorization remains the real
 * security boundary.
 */
export default function ProtectedRoute({
  children,
  resource,
  action,
}: ProtectedRouteProps) {
  const router = useRouter();

  /* ===================================================
     PERMISSION ENGINE
  =================================================== */

  const { can } = usePermission();

  /* ===================================================
     AUTH STATE
  =================================================== */

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useSelector(
    (state: RootState) => state.auth,
  );

  /* ===================================================
     AUTHORIZATION
  =================================================== */

  useEffect(() => {
    if (isLoading) {
      return;
    }

    /* =================================================
       AUTHENTICATION CHECK
    ================================================= */

    if (!user || !isAuthenticated) {
      router.replace("/login");
      return;
    }

    /* =================================================
       PERMISSION CHECK
    ================================================= */

    /*
     * If a resource and action were provided,
     * the authenticated user must have that permission.
     */
    if (
      resource &&
      action &&
      !can(resource, action)
    ) {
      router.replace("/unauthorized");
      return;
    }
  }, [
    user,
    isAuthenticated,
    isLoading,
    resource,
    action,
    can,
    router,
  ]);

  /* ===================================================
     LOADING STATE
  =================================================== */

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-5 animate-in fade-in duration-500">
          {/* Layered spinner */}
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-muted/40" />

            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />

            <div
              className="absolute inset-2 rounded-full border-2 border-transparent border-t-primary/40 animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.2s",
              }}
            />
          </div>

          {/* Loading text */}
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Preparing your workspace
            </p>

            <p className="max-w-[220px] text-xs text-muted-foreground">
              This will only take a moment
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse"
                style={{
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ===================================================
     AUTHORIZED CONTENT
  =================================================== */

  return children;
}