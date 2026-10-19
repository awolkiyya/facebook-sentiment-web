"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
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
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type {
  UserQueryParams,
} from "@/types/user"

import {
  useDeleteUser,
  useUpdateUserStatus,
  useUsers,
} from "@/hooks/user/user.hooks"

/**
 * ============================================================================
 * USERS PAGE
 * ============================================================================
 *
 * User Management
 *
 * API:
 *
 *     GET    /api/v1/users
 *     PATCH  /api/v1/users/{user}/status
 *     DELETE /api/v1/users/{user}
 *
 * Data fetching:
 *
 *     React Query
 *
 * Backend:
 *
 *     Laravel + Spatie Permission
 * ============================================================================
 */

function UsersPage() {
  const router = useRouter()
  const params = useParams()

  /*
   * --------------------------------------------------------------------------
   * LOCALE
   * --------------------------------------------------------------------------
   */

  const locale =
    typeof params?.locale === "string"
      ? params.locale
      : "or"

  const usersUrl =
    `/${locale}/dashboard/administration/users`

  /*
   * --------------------------------------------------------------------------
   * LOCAL FILTER STATE
   * --------------------------------------------------------------------------
   */

  const [searchInput, setSearchInput] =
    React.useState("")

  const [search, setSearch] =
    React.useState("")

  const [
    statusFilter,
    setStatusFilter,
  ] = React.useState<
    "all" | "active" | "inactive"
  >("all")

  const [page, setPage] =
    React.useState(1)

  const perPage = 20

  /*
   * --------------------------------------------------------------------------
   * DEBOUNCE SEARCH
   * --------------------------------------------------------------------------
   */

  React.useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        setSearch(
          searchInput.trim()
        )

        setPage(1)
      }, 350)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [searchInput])

  /*
   * --------------------------------------------------------------------------
   * QUERY PARAMETERS
   * --------------------------------------------------------------------------
   */

  const queryParams =
    React.useMemo<UserQueryParams>(() => {
      const params: UserQueryParams = {
        page,
        per_page: perPage,
        sort_by: "created_at",
        sort_direction: "desc",
      }

      if (search) {
        params.search = search
      }

      if (statusFilter === "active") {
        params.is_active = true
      }

      if (statusFilter === "inactive") {
        params.is_active = false
      }

      return params
    }, [
      page,
      search,
      statusFilter,
    ])

  /*
   * --------------------------------------------------------------------------
   * USERS QUERY
   * --------------------------------------------------------------------------
   */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUsers(queryParams)

  /*
   * --------------------------------------------------------------------------
   * MUTATIONS
   * --------------------------------------------------------------------------
   */

  const deleteUser =
    useDeleteUser()

  const updateUserStatus =
    useUpdateUserStatus()

  /*
   * --------------------------------------------------------------------------
   * API DATA
   * --------------------------------------------------------------------------
   */

  const users =
    data?.data ?? []

  const meta =
    data?.meta

  /*
   * --------------------------------------------------------------------------
   * PAGINATION VALUES
   * --------------------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Laravel API returns:
   *
   * meta.current_page
   * meta.from
   * meta.last_page
   * meta.per_page
   * meta.to
   * meta.total
   *
   * There is NO meta.pagination object.
   * --------------------------------------------------------------------------
   */

  const currentPage =
    meta?.pagination?.current_page ?? 1

  const lastPage =
    meta?.pagination?.last_page ?? 1

  const totalUsers =
    meta?.pagination?.total ?? 0

  /*
   * --------------------------------------------------------------------------
   * SUMMARY
   * --------------------------------------------------------------------------
   *
   * Active / inactive counts below represent the currently loaded page.
   *
   * If you need exact system-wide active/inactive counts, create a
   * dedicated backend summary endpoint.
   * --------------------------------------------------------------------------
   */

  const activeUsers =
    users.filter(
      (user) =>
        user.is_active
    ).length

  const inactiveUsers =
    users.filter(
      (user) =>
        !user.is_active
    ).length

  /*
   * --------------------------------------------------------------------------
   * NAVIGATION
   * --------------------------------------------------------------------------
   */

  const handleCreateUser = () => {
    router.push(
      `${usersUrl}/create`
    )
  }

  const handleEditUser = (
    userId: string
  ) => {
    router.push(
      `${usersUrl}/${userId}/edit`
    )
  }

  const handleViewUser = (
    userId: string
  ) => {
    router.push(
      `${usersUrl}/${userId}`
    )
  }

  const handleManageRoles = (
    userId: string
  ) => {
    router.push(
      `${usersUrl}/${userId}/roles`
    )
  }

  /*
   * --------------------------------------------------------------------------
   * STATUS
   * --------------------------------------------------------------------------
   */

  const handleStatusChange = (
    userId: string,
    isActive: boolean
  ) => {
    updateUserStatus.mutate({
      userId,
      data: {
        is_active: isActive,
      },
    })
  }

  /*
   * --------------------------------------------------------------------------
   * DELETE
   * --------------------------------------------------------------------------
   */

  const handleDeleteUser = (
    userId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this user?"
      )

    if (!confirmed) {
      return
    }

    deleteUser.mutate(userId)
  }

  /*
   * --------------------------------------------------------------------------
   * PAGE CHANGE
   * --------------------------------------------------------------------------
   */

  const handlePreviousPage = () => {
    if (currentPage <= 1) {
      return
    }

    setPage(
      currentPage - 1
    )
  }

  const handleNextPage = () => {
    if (currentPage >= lastPage) {
      return
    }

    setPage(
      currentPage + 1
    )
  }

  /*
   * --------------------------------------------------------------------------
   * ERROR STATE
   * --------------------------------------------------------------------------
   */

  if (isError) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Users
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage users and their access to Mayor Social Analytics.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="text-center">
              <h2 className="font-semibold">
                Unable to load users
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message ||
                  "Something went wrong while loading users."}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                refetch()
              }
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  /*
   * --------------------------------------------------------------------------
   * RENDER
   * --------------------------------------------------------------------------
   */

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Users
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage users and their access to Mayor Social Analytics.
          </p>
        </div>

        <Button
          onClick={
            handleCreateUser
          }
        >
          <Plus className="mr-2 size-4" />
          Add User
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Summary                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <UsersIcon />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Users
              </p>

              {isLoading ? (
                <div className="mt-1 h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-semibold">
                  {totalUsers}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <UserCheck className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Active Users
              </p>

              {isLoading ? (
                <div className="mt-1 h-8 w-12 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-semibold">
                  {activeUsers}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inactive */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <UserX className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Inactive Users
              </p>

              {isLoading ? (
                <div className="mt-1 h-8 w-12 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-semibold">
                  {inactiveUsers}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Users                                                              */}
      {/* ------------------------------------------------------------------ */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>
                System Users
              </CardTitle>

              <CardDescription>
                View and manage registered system users.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={
                    searchInput
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchInput(
                      event.target.value
                    )
                  }
                  placeholder="Search users..."
                  className="w-full pl-9 sm:w-[260px]"
                />
              </div>

              {/* Status */}
              <div className="flex rounded-md border p-1">
                <Button
                  variant={
                    statusFilter ===
                    "all"
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() => {
                    setStatusFilter(
                      "all"
                    )
                    setPage(1)
                  }}
                >
                  All
                </Button>

                <Button
                  variant={
                    statusFilter ===
                    "active"
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() => {
                    setStatusFilter(
                      "active"
                    )
                    setPage(1)
                  }}
                >
                  Active
                </Button>

                <Button
                  variant={
                    statusFilter ===
                    "inactive"
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() => {
                    setStatusFilter(
                      "inactive"
                    )
                    setPage(1)
                  }}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y bg-muted/40">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">
                    User
                  </th>

                  <th className="px-6 py-3 text-left font-medium">
                    Role
                  </th>

                  <th className="px-6 py-3 text-left font-medium">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left font-medium">
                    Last Login
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
                        className="border-b"
                      >
                        <td
                          colSpan={5}
                          className="px-6 py-6"
                        >
                          <div className="h-10 animate-pulse rounded bg-muted" />
                        </td>
                      </tr>
                    )
                  )
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <p className="font-medium">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Try changing your search or filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map(
                    (user) => {
                      const primaryRole =
                        user.roles?.[0]

                      return (
                        <tr
                          key={
                            user.id
                          }
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          {/* User */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9">
                                <AvatarFallback>
                                  {getInitials(
                                    user.name
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {
                                    user.name
                                  }
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                  {
                                    user.email
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="size-4 text-muted-foreground" />

                              {primaryRole ? (
                                <span>
                                  {
                                    primaryRole.name
                                  }
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  No role assigned
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {user.is_active ? (
                              <Badge variant="secondary">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Inactive
                              </Badge>
                            )}
                          </td>

                          {/* Last Login */}
                          <td className="px-6 py-4 text-muted-foreground">
                            {user.last_login_at
                              ? formatDate(
                                  user.last_login_at
                                )
                              : "Never"}
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
                                    handleViewUser(
                                      user.id
                                    )
                                  }
                                >
                                  View User
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEditUser(
                                      user.id
                                    )
                                  }
                                >
                                  Edit User
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    handleManageRoles(
                                      user.id
                                    )
                                  }
                                >
                                  Manage Roles
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {user.is_active ? (
                                  <DropdownMenuItem
                                    disabled={
                                      updateUserStatus.isPending
                                    }
                                    onClick={() =>
                                      handleStatusChange(
                                        user.id,
                                        false
                                      )
                                    }
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    disabled={
                                      updateUserStatus.isPending
                                    }
                                    onClick={() =>
                                      handleStatusChange(
                                        user.id,
                                        true
                                      )
                                    }
                                  >
                                    Activate
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  disabled={
                                    deleteUser.isPending
                                  }
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteUser(
                                      user.id
                                    )
                                  }
                                >
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Pagination                                                       */}
          {/* ---------------------------------------------------------------- */}

          {meta && (
            <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  { meta?.pagination?.from ?? 0}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  { meta?.pagination?.to ?? 0}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  { meta?.pagination?.total}
                </span>{" "}
                users
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    currentPage <= 1 ||
                    isFetching
                  }
                  onClick={
                    handlePreviousPage
                  }
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page{" "}
                  <span className="font-medium text-foreground">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {lastPage}
                  </span>
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    currentPage >= lastPage ||
                    isFetching
                  }
                  onClick={
                    handleNextPage
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * ============================================================================
 * HELPERS
 * ============================================================================
 */

function getInitials(
  name: string
) {
  return name
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part[0]
    )
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatDate(
  value: string
) {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date)
}

function UsersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export default UsersPage