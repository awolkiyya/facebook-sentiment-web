"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  KeyRound,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRoles } from "@/hooks/role/role.hooks"
import type { RoleQueryParams } from "@/types/role"

function RolesPage() {
  const router = useRouter()
  const params = useParams()

  const locale =
    typeof params?.locale === "string"
      ? params.locale
      : "or"

  const rolesUrl =
    `/${locale}/dashboard/administration/roles`

  const [search, setSearch] =
    React.useState("")

  /*
  |--------------------------------------------------------------------------
  | Query parameters
  |--------------------------------------------------------------------------
  */

  const queryParams =
    React.useMemo<RoleQueryParams>(() => {
      const query: RoleQueryParams = {
        page: 1,
        per_page: 20,
        sort_by: "created_at",
        sort_direction: "desc",
      }

      const trimmedSearch =
        search.trim()

      if (trimmedSearch) {
        query.search = trimmedSearch
      }

      return query
    }, [search])

  /*
  |--------------------------------------------------------------------------
  | Roles query
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useRoles(queryParams)

  const roles = data?.data ?? []

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const pagination =
    data?.meta.pagination

  const totalRoles =
    pagination?.total ?? 0

  /*
  |--------------------------------------------------------------------------
  | Current-page statistics
  |--------------------------------------------------------------------------
  |
  | These values represent the currently loaded page.
  |
  | For global dashboard statistics, the backend should
  | eventually provide `meta.summary`.
  |
  */

  const systemRoles =
    roles.filter(
      (role) => role.type === "SYSTEM",
    ).length

  const customRoles =
    roles.filter(
      (role) => role.type === "CUSTOM",
    ).length

  const assignedUsers =
    roles.reduce(
      (total, role) =>
        total + role.users_count,
      0,
    )

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const handleCreateRole = () => {
    router.push(
      `${rolesUrl}/create`,
    )
  }

  const handleEditRole = (
    roleId: string,
  ) => {
    router.push(
      `${rolesUrl}/${roleId}/edit`,
    )
  }

  const handleViewRole = (
    roleId: string,
  ) => {
    router.push(
      `${rolesUrl}/${roleId}`,
    )
  }

  const handleViewUsers = (
    roleId: string,
  ) => {
    router.push(
      `${rolesUrl}/${roleId}/users`,
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Roles
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage roles and control access to
            platform resources.
          </p>
        </div>

        <Button
          onClick={handleCreateRole}
        >
          <Plus className="mr-2 size-4" />
          Create Role
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Roles */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Roles
              </p>

              <p className="text-2xl font-semibold">
                {isLoading
                  ? "—"
                  : totalRoles}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Roles */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                System Roles
              </p>

              <p className="text-2xl font-semibold">
                {isLoading
                  ? "—"
                  : systemRoles}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Roles */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <KeyRound className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Custom Roles
              </p>

              <p className="text-2xl font-semibold">
                {isLoading
                  ? "—"
                  : customRoles}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Users */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Users className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Assigned Users
              </p>

              <p className="text-2xl font-semibold">
                {isLoading
                  ? "—"
                  : assignedUsers}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>
                Roles
              </CardTitle>

              <CardDescription>
                Roles define what users can access
                and manage within the platform.
              </CardDescription>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search roles..."
                className="w-full pl-9 sm:w-[280px]"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isError ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium">
                Failed to load roles
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message ??
                  "Something went wrong while loading roles."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y bg-muted/40">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">
                        Role
                      </th>

                      <th className="px-6 py-3 text-left font-medium">
                        Users
                      </th>

                      <th className="px-6 py-3 text-left font-medium">
                        Permissions
                      </th>

                      <th className="px-6 py-3 text-left font-medium">
                        Type
                      </th>

                      <th className="px-6 py-3 text-left font-medium">
                        Created
                      </th>

                      <th className="w-12 px-6 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      Array.from({
                        length: 5,
                      }).map(
                        (_, index) => (
                          <tr
                            key={index}
                            className="border-b last:border-0"
                          >
                            <td
                              colSpan={6}
                              className="px-6 py-5"
                            >
                              <div className="h-5 w-full animate-pulse rounded bg-muted" />
                            </td>
                          </tr>
                        ),
                      )
                    ) : roles.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                              <ShieldCheck className="size-5 text-muted-foreground" />
                            </div>

                            <p className="mt-3 font-medium">
                              No roles found
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {search.trim()
                                ? "Try changing your search."
                                : "Create your first role to get started."}
                            </p>

                            {!search.trim() && (
                              <Button
                                className="mt-4"
                                onClick={
                                  handleCreateRole
                                }
                              >
                                <Plus className="mr-2 size-4" />
                                Create Role
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      roles.map(
                        (role) => (
                          <tr
                            key={role.id}
                            className="border-b last:border-0 hover:bg-muted/30"
                          >
                            {/* Role */}
                            <td className="max-w-[420px] px-6 py-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                  <ShieldCheck className="size-4" />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {role.name}
                                    </p>

                                    {role.type ===
                                      "SYSTEM" && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px]"
                                      >
                                        System
                                      </Badge>
                                    )}
                                  </div>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Guard:{" "}
                                    {
                                      role.guard_name
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Users */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Users className="size-4 text-muted-foreground" />

                                <span>
                                  {
                                    role.users_count
                                  }
                                </span>
                              </div>
                            </td>

                            {/* Permissions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <KeyRound className="size-4 text-muted-foreground" />

                                <span>
                                  {
                                    role.permissions_count
                                  }
                                </span>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="px-6 py-4">
                              {role.type ===
                                "SYSTEM" ? (
                                <Badge variant="secondary">
                                  System
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Custom
                                </Badge>
                              )}
                            </td>

                            {/* Created */}
                            <td className="px-6 py-4 text-muted-foreground">
                              {new Date(
                                role.created_at,
                              ).toLocaleDateString()}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                  >
                                    <MoreHorizontal className="size-4" />

                                    <span className="sr-only">
                                      Open actions
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewRole(
                                        role.id,
                                      )
                                    }
                                  >
                                    View Role
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditRole(
                                        role.id,
                                      )
                                    }
                                  >
                                    Edit Role
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewUsers(
                                        role.id,
                                      )
                                    }
                                  >
                                    View Users
                                  </DropdownMenuItem>

                                  {role.type ===
                                    "CUSTOM" && (
                                    <>
                                      <DropdownMenuSeparator />

                                      <DropdownMenuItem>
                                        Duplicate Role
                                      </DropdownMenuItem>

                                      <DropdownMenuItem className="text-destructive">
                                        Delete Role
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {roles.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {totalRoles}
                  </span>{" "}
                  roles
                </p>

                {isFetching &&
                  !isLoading && (
                    <span className="text-xs text-muted-foreground">
                      Updating...
                    </span>
                  )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RolesPage