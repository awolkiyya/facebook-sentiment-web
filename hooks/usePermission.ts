"use client";

import { useSelector } from "react-redux";

import { RootState } from "@/lib/store/store";
import {
  PermissionAction,
  UserPermission,
} from "@/types/user";

/* =====================================================
   PERMISSION HOOK
===================================================== */

/**
 * Provides permission-based authorization helpers.
 *
 * IMPORTANT:
 *
 * Frontend authorization is permission-driven.
 *
 * Roles are NOT checked here.
 *
 * Backend:
 *
 *   Role
 *     ↓
 *   Permissions
 *     ↓
 *   Authenticated User
 *     ↓
 *   Frontend Permission Checks
 *
 * The backend remains the real security boundary.
 */
export function usePermission() {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  /* ===================================================
     NORMALIZE PERMISSIONS
  =================================================== */

  /**
   * Protect against:
   *
   * - undefined
   * - null
   * - malformed Redux state
   *
   * Expected API structure:
   *
   * permissions: [
   *   {
   *     resource: "facebook_pages",
   *     actions: ["view"]
   *   }
   * ]
   */
  const permissions: UserPermission[] =
    Array.isArray(user?.permissions)
      ? user.permissions
      : [];

  /* ===================================================
     CHECK PERMISSION
  =================================================== */

  const can = (
    resource: string,
    action: PermissionAction,
  ): boolean => {
    return permissions.some(
      (permission) =>
        permission.resource === resource &&
        permission.actions.includes(action),
    );
  };

  /* ===================================================
     CHECK MULTIPLE PERMISSIONS
  =================================================== */

  const canAny = (
    permissionList: Array<{
      resource: string;
      action: PermissionAction;
    }>,
  ): boolean => {
    return permissionList.some(
      ({ resource, action }) =>
        can(resource, action),
    );
  };

  const canAll = (
    permissionList: Array<{
      resource: string;
      action: PermissionAction;
    }>,
  ): boolean => {
    return permissionList.every(
      ({ resource, action }) =>
        can(resource, action),
    );
  };

  /* ===================================================
     RETURN
  =================================================== */

  return {
    permissions,
    can,
    canAny,
    canAll,
  };
}