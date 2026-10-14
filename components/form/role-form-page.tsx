"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  KeyRound,
  ShieldCheck,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/types/role"
import type { Permission } from "@/types/permission"

import {
  useCreateRole,
  useRole,
  useUpdateRole,
} from "@/hooks/role/role.hooks"
import { usePermissions } from "@/hooks/permission/use-permissions"

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface PermissionGroup {
  key: string
  label: string
  description?: string
  permissions: Permission[]
}

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const ROLES_URL =
  "/or/dashboard/administration/roles"

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Safely converts a role name into a human-readable label.
 *
 * USER
 * -> User
 *
 * ANALYTICS_OFFICER
 * -> Analytics Officer
 */
function formatRoleName(
  value?: string | null,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return "Unnamed Role"
  }

  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    )
}

/**
 * Normalize a role name before submission.
 *
 * analytics officer
 * -> ANALYTICS_OFFICER
 *
 * Analytics-Officer
 * -> ANALYTICS_OFFICER
 */
function normalizeRoleName(
  value: string,
): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
}

/**
 * Safely extract permission names from a role.
 *
 * Expected role structure:
 *
 * {
 *   permissions: [
 *     {
 *       id: "...",
 *       name: "dashboard.view"
 *     }
 *   ]
 * }
 */
function getRolePermissionNames(
  rolePermissions:
    | Array<{
        id?: string
        name?: string | null
      }>
    | null
    | undefined,
): string[] {
  if (!Array.isArray(rolePermissions)) {
    return []
  }

  return Array.from(
    new Set(
      rolePermissions
        .map(
          (permission) =>
            permission?.name,
        )
        .filter(
          (
            name,
          ): name is string =>
            typeof name === "string" &&
            name.trim().length > 0,
        )
        .map((name) => name.trim()),
    ),
  )
}

/**
 * Groups permissions returned by the backend.
 *
 * The backend remains the source of truth
 * for permission grouping and metadata.
 */
function buildPermissionGroups(
  permissions: Permission[],
): PermissionGroup[] {
  const groups =
    new Map<string, PermissionGroup>()

  for (const permission of permissions) {
    const groupKey =
      permission.group ||
      permission.resource ||
      "other"

    const groupLabel =
      permission.group_label ||
      permission.group ||
      permission.resource ||
      "Other"

    const existingGroup =
      groups.get(groupKey)

    if (existingGroup) {
      existingGroup.permissions.push(
        permission,
      )

      continue
    }

    groups.set(groupKey, {
      key: groupKey,
      label: groupLabel,
      description:
        permission.group_description,
      permissions: [permission],
    })
  }

  return Array.from(groups.values())
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

function RoleFormPage() {
  const router = useRouter()
  const params = useParams()

  /*
  |--------------------------------------------------------------------------
  | Route
  |--------------------------------------------------------------------------
  */

  const roleId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined

  const isEditMode =
    Boolean(roleId)

  /*
  |--------------------------------------------------------------------------
  | Queries
  |--------------------------------------------------------------------------
  */

  const {
    data: role,
    isLoading: isRoleLoading,
    isError: isRoleError,
    error: roleError,
  } = useRole(roleId)


  console.log("role",role);

  const {
    data: permissions = [],
    isLoading:
      isPermissionsLoading,
    isError:
      isPermissionsError,
    error: permissionsError,
  } = usePermissions()

  /*
  |--------------------------------------------------------------------------
  | Mutations
  |--------------------------------------------------------------------------
  */

  const createRoleMutation =
    useCreateRole()

  const updateRoleMutation =
    useUpdateRole()

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [name, setName] =
    React.useState("")

  const [
    selectedPermissions,
    setSelectedPermissions,
  ] = React.useState<string[]>([])

  const [
    openGroups,
    setOpenGroups,
  ] = React.useState<string[]>([])

  /*
  |--------------------------------------------------------------------------
  | Permission Groups
  |--------------------------------------------------------------------------
  */

  const permissionGroups =
    React.useMemo(
      () =>
        buildPermissionGroups(
          Array.isArray(permissions)
            ? permissions
            : [],
        ),
      [permissions],
    )

  /*
  |--------------------------------------------------------------------------
  | Available Permission Names
  |--------------------------------------------------------------------------
  */

  const availablePermissionNames =
    React.useMemo(
      () =>
        new Set(
          (
            Array.isArray(
              permissions,
            )
              ? permissions
              : []
          )
            .map(
              (permission) =>
                permission.name,
            )
            .filter(
              (
                name,
              ): name is string =>
                typeof name === "string" &&
                name.trim().length > 0,
            ),
        ),
      [permissions],
    )

  /*
  |--------------------------------------------------------------------------
  | System Role
  |--------------------------------------------------------------------------
  */

  const isSystemRole =
    isEditMode &&
    role?.type === "SYSTEM"

  /*
  |--------------------------------------------------------------------------
  | Form Initialization
  |--------------------------------------------------------------------------
  |
  | The API response is:
  |
  | {
  |   success: true,
  |   data: {
  |     id: "...",
  |     name: "USER",
  |     permissions: [...]
  |   }
  | }
  |
  | useRole() must therefore return:
  |
  | response.data.data
  |
  | so that:
  |
  | role.permissions
  |
  | contains the assigned permissions.
  |
  | This effect initializes the form once per
  | role ID and does not overwrite user changes
  | after initialization.
  |
  */

  const initializedRoleId =
    React.useRef<string | null>(
      null,
    )

  React.useEffect(() => {
    /*
     * Create mode.
     *
     * There is no role to initialize.
     */
    if (!isEditMode || !roleId) {
      initializedRoleId.current = null

      setName("")
      setSelectedPermissions([])

      return
    }

    /*
     * Wait until the role has loaded.
     */
    if (!role) {
      return
    }

    /*
     * Prevent a React Query refetch from
     * resetting the user's current changes.
     */
    if (
      initializedRoleId.current ===
      roleId
    ) {
      return
    }

    /*
     * Mark this role as initialized.
     */
    initializedRoleId.current =
      roleId

    /*
     * Initialize role name.
     */
    setName(
      typeof role.name === "string"
        ? role.name
        : "",
    )

    /*
     * Initialize assigned permissions.
     *
     * API:
     *
     * permissions: [
     *   { id: "...", name: "dashboard.view" },
     *   { id: "...", name: "analytics.view" }
     * ]
     *
     * Form state:
     *
     * [
     *   "dashboard.view",
     *   "analytics.view"
     * ]
     */
    const rolePermissionNames =
      getRolePermissionNames(
        role.permissions,
      )

    setSelectedPermissions(
      rolePermissionNames,
    )
  }, [
    isEditMode,
    roleId,
    role,
  ])

  /*
  |--------------------------------------------------------------------------
  | Permission Groups Initialization
  |--------------------------------------------------------------------------
  */

  React.useEffect(() => {
    if (
      permissionGroups.length ===
      0
    ) {
      return
    }

    setOpenGroups((current) => {
      if (current.length > 0) {
        return current
      }

      return permissionGroups.map(
        (group) =>
          group.key,
      )
    })
  }, [
    permissionGroups,
  ])

  /*
  |--------------------------------------------------------------------------
  | Derived State
  |--------------------------------------------------------------------------
  */

  const selectedCount =
    selectedPermissions.length

  const normalizedName =
    normalizeRoleName(name)

  const isSubmitting =
    createRoleMutation.isPending ||
    updateRoleMutation.isPending

  /*
  |--------------------------------------------------------------------------
  | Permission Actions
  |--------------------------------------------------------------------------
  */

  const togglePermission =
    React.useCallback(
      (
        permissionName: string,
        checked: boolean,
      ) => {
        if (isSystemRole) {
          return
        }

        setSelectedPermissions(
          (current) => {
            if (checked) {
              if (
                current.includes(
                  permissionName,
                )
              ) {
                return current
              }

              return [
                ...current,
                permissionName,
              ]
            }

            return current.filter(
              (item) =>
                item !==
                permissionName,
            )
          },
        )
      },
      [isSystemRole],
    )

  const toggleGroup =
    React.useCallback(
      (groupKey: string) => {
        setOpenGroups(
          (current) =>
            current.includes(
              groupKey,
            )
              ? current.filter(
                  (item) =>
                    item !==
                    groupKey,
                )
              : [
                  ...current,
                  groupKey,
                ],
        )
      },
      [],
    )

  const isGroupFullySelected =
    React.useCallback(
      (
        group: PermissionGroup,
      ): boolean => {
        if (
          group.permissions
            .length === 0
        ) {
          return false
        }

        return group.permissions.every(
          (permission) =>
            selectedPermissions.includes(
              permission.name,
            ),
        )
      },
      [selectedPermissions],
    )

  const toggleGroupPermissions =
    React.useCallback(
      (
        group: PermissionGroup,
      ) => {
        if (isSystemRole) {
          return
        }

        const permissionNames =
          group.permissions
            .map(
              (permission) =>
                permission.name,
            )
            .filter(
              (
                name,
              ): name is string =>
                typeof name ===
                  "string" &&
                name.trim().length > 0,
            )

        if (
          permissionNames.length ===
          0
        ) {
          return
        }

        const fullySelected =
          permissionNames.every(
            (permissionName) =>
              selectedPermissions.includes(
                permissionName,
              ),
          )

        setSelectedPermissions(
          (current) => {
            if (fullySelected) {
              return current.filter(
                (permission) =>
                  !permissionNames.includes(
                    permission,
                  ),
              )
            }

            return Array.from(
              new Set([
                ...current,
                ...permissionNames,
              ]),
            )
          },
        )
      },
      [
        isSystemRole,
        selectedPermissions,
      ],
    )

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      if (isSystemRole) {
        return
      }

      const finalName =
        normalizeRoleName(name)

      if (!finalName) {
        return
      }

      /*
       * Only submit permissions that
       * currently exist in the backend
       * permission catalog.
       */
      const validSelectedPermissions =
        selectedPermissions.filter(
          (permissionName) =>
            availablePermissionNames.has(
              permissionName,
            ),
        )

      /*
      |--------------------------------------------------------------------------
      | Create
      |--------------------------------------------------------------------------
      */

      if (!isEditMode) {
        const payload: CreateRoleRequest =
          {
            name: finalName,
            permissions:
              validSelectedPermissions,
          }

        await createRoleMutation.mutateAsync(
          payload,
        )

        router.push(
          ROLES_URL,
        )

        return
      }

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      if (!roleId) {
        return
      }

      const payload: UpdateRoleRequest =
        {
          name: finalName,
          permissions:
            validSelectedPermissions,
        }

      await updateRoleMutation.mutateAsync(
        {
          roleId,
          data: payload,
        },
      )

      router.push(
        ROLES_URL,
      )
    }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    (isEditMode &&
      isRoleLoading) ||
    isPermissionsLoading
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <KeyRound className="size-4 animate-pulse" />

          <span>
            Loading role permissions...
          </span>
        </div>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Role Error
  |--------------------------------------------------------------------------
  */

  if (
    isEditMode &&
    isRoleError
  ) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
        <ShieldCheck className="size-10 text-muted-foreground" />

        <div className="text-center">
          <h2 className="font-semibold">
            Unable to load role
          </h2>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {roleError?.message ??
              "The requested role could not be loaded."}
          </p>
        </div>

        <Button
          variant="outline"
          asChild
        >
          <Link
            href={ROLES_URL}
          >
            <ArrowLeft className="mr-2 size-4" />

            Back to Roles
          </Link>
        </Button>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Permission Error
  |--------------------------------------------------------------------------
  */

  if (
    isPermissionsError
  ) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
        <KeyRound className="size-10 text-muted-foreground" />

        <div className="text-center">
          <h2 className="font-semibold">
            Unable to load permissions
          </h2>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {permissionsError?.message ??
              "Available permissions could not be loaded."}
          </p>
        </div>

        <Button
          variant="outline"
          asChild
        >
          <Link
            href={ROLES_URL}
          >
            <ArrowLeft className="mr-2 size-4" />

            Back to Roles
          </Link>
        </Button>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <Link
              href={ROLES_URL}
            >
              <ArrowLeft className="size-4" />

              <span className="sr-only">
                Back to roles
              </span>
            </Link>
          </Button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {isEditMode
                  ? "Update Role"
                  : "Create Role"}
              </h1>

              {isEditMode &&
                role && (
                  <>
                    <Badge variant="outline">
                      {formatRoleName(
                        role.name,
                      )}
                    </Badge>

                    <Badge
                      variant={
                        isSystemRole
                          ? "default"
                          : "secondary"
                      }
                    >
                      {role.type}
                    </Badge>
                  </>
                )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditMode
                ? "Update the role name and assigned permissions."
                : "Create a role and assign permissions to control system access."}
            </p>
          </div>
        </div>
      </div>

      {/* System Role Notice */}

      {isSystemRole && (
        <Card className="border-muted">
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" />

            <div>
              <p className="font-medium">
                System Role
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                This role is managed by the
                system. Its name and
                permissions cannot be
                modified.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        {/* Basic Information */}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5" />

              <CardTitle>
                Basic Information
              </CardTitle>
            </div>

            <CardDescription>
              Define the role name used by the
              authorization system.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex max-w-2xl flex-col gap-2">
              <Label htmlFor="role-name">
                Role Name
              </Label>

              <Input
                id="role-name"
                value={name}
                disabled={isSystemRole}
                onChange={(event) =>
                  setName(
                    normalizeRoleName(
                      event.target.value,
                    ),
                  )
                }
                placeholder="e.g. ANALYTICS_OFFICER"
                autoComplete="off"
                spellCheck={false}
                required
              />

              <p className="text-xs text-muted-foreground">
                Use uppercase letters,
                numbers, and underscores.
                Example:
                ANALYTICS_OFFICER.
              </p>

              {name.trim() &&
                normalizedName !==
                  name && (
                  <p className="text-xs text-muted-foreground">
                    Will be saved as:{" "}
                    <span className="font-mono font-medium">
                      {
                        normalizedName
                      }
                    </span>
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Role Type */}

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <ShieldCheck className="size-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Role Type
                </p>

                <p className="font-semibold">
                  {isSystemRole
                    ? "System Role"
                    : "Custom Role"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Permission Count */}

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <KeyRound className="size-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Selected Permissions
                </p>

                <p className="font-semibold">
                  {selectedCount}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Users */}

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Users className="size-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Assigned Users
                </p>

                <p className="font-semibold">
                  {isEditMode
                    ? `${role?.users_count ?? 0} users`
                    : "0 users"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions */}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Permissions
                </CardTitle>

                <CardDescription>
                  Select the permissions this role
                  should have.
                </CardDescription>
              </div>

              <Badge variant="secondary">
                {selectedCount} selected
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {permissionGroups.map(
              (group) => {
                const isOpen =
                  openGroups.includes(
                    group.key,
                  )

                const isFullySelected =
                  isGroupFullySelected(
                    group,
                  )

                return (
                  <div
                    key={group.key}
                    className="overflow-hidden rounded-lg border"
                  >
                    {/* Group Header */}

                    <div className="flex items-center justify-between gap-3 bg-muted/30 px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          toggleGroup(
                            group.key,
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        aria-expanded={
                          isOpen
                        }
                        aria-controls={`permission-group-${group.key}`}
                      >
                        <ChevronDown
                          className={`size-4 shrink-0 transition-transform ${
                            isOpen
                              ? ""
                              : "-rotate-90"
                          }`}
                        />

                        <div className="min-w-0">
                          <p className="font-medium">
                            {
                              group.label
                            }
                          </p>

                          {group.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {
                                group.description
                              }
                            </p>
                          )}
                        </div>
                      </button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          isSystemRole ||
                          group.permissions
                            .length ===
                            0
                        }
                        onClick={() =>
                          toggleGroupPermissions(
                            group,
                          )
                        }
                      >
                        {isFullySelected
                          ? "Clear"
                          : "Select All"}
                      </Button>
                    </div>

                    {/* Group Permissions */}

                    {isOpen && (
                      <div
                        id={`permission-group-${group.key}`}
                        className="divide-y"
                      >
                        {group.permissions.map(
                          (
                            permission,
                          ) => {
                            const isSelected =
                              selectedPermissions.includes(
                                permission.name,
                              )

                            return (
                              <div
                                key={
                                  permission.id
                                }
                                className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium">
                                    {
                                      permission.label
                                    }
                                  </p>

                                  {permission.description && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {
                                        permission.description
                                      }
                                    </p>
                                  )}

                                  <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                                    {
                                      permission.name
                                    }
                                  </p>
                                </div>

                                <label
                                  className={`flex shrink-0 items-center gap-2 text-sm ${
                                    isSystemRole
                                      ? "cursor-not-allowed opacity-60"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <Checkbox
                                    checked={
                                      isSelected
                                    }
                                    disabled={
                                      isSystemRole
                                    }
                                    onCheckedChange={(
                                      checked,
                                    ) => {
                                      if (
                                        checked ===
                                          true ||
                                        checked ===
                                          false
                                      ) {
                                        togglePermission(
                                          permission.name,
                                          checked,
                                        )
                                      }
                                    }}
                                    aria-label={`Grant ${permission.name}`}
                                  />

                                  <span>
                                    {
                                      permission.action_label
                                    }
                                  </span>
                                </label>
                              </div>
                            )
                          },
                        )}
                      </div>
                    )}
                  </div>
                )
              },
            )}

            {/* Empty */}

            {permissionGroups.length ===
              0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <KeyRound className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-3 font-medium">
                  No permissions available
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  No API permissions are
                  currently available for
                  role assignment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link
              href={ROLES_URL}
            >
              Cancel
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              Boolean(isSystemRole) ||
              !normalizedName
            }
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Check className="mr-2 size-4" />

                {isEditMode
                  ? "Update Role"
                  : "Create Role"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default RoleFormPage

