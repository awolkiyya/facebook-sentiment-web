"use client"

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useParams, useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import type { Role } from "@/types/role"
import { useRoles } from "@/hooks/role/role.hooks"

import type { User } from "@/types/user"
/*
 * ASSUMPTION: path/name of the user hooks module — adjust the import path
 * below if your project exposes these hooks somewhere else (e.g.
 * "@/hooks/user/user.hooks" vs "@/hooks/user.hooks").
 */
import {
  useUser,
  useCreateUser,
  useUpdateUser,
  useUpdateUserStatus,
  useResetUserPassword,
  useAssignUserRoles,
} from "@/hooks/user/user.hooks"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type UserStatus = "ACTIVE" | "INACTIVE"

type FormField = keyof UserFormData

interface UserFormData {
  name: string
  email: string
  phone: string
  role: string
  status: UserStatus
  password: string
  passwordConfirmation: string
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return initials || "?"
}

/**
 * Convert a technical role name such as:
 *
 * SYSTEM_ADMIN
 * DATA_MANAGER
 * EXECUTIVE_VIEWER
 *
 * into a readable UI label.
 */
function formatRoleName(name: string) {
  return name
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ")
}

/**
 * Roles are supplied by the backend. Confirmed response envelope:
 *
 * {
 *   success: boolean
 *   message: string
 *   data: Role[]   // id, name, guard_name, type, users_count,
 *                   // permissions_count, created_at, updated_at
 *   meta: { timestamp, request_id, version, pagination }
 * }
 *
 * `useRoles` is expected to unwrap the axios response to `response.data.data`
 * (the Role[] array) rather than exposing the full envelope here. The backend
 * does not persist a role description/scope, so those are derived for
 * presentation rather than maintained as a second hardcoded role list.
 */
function getRoleDescription(role: Role) {
  if (role.type === "SYSTEM") {
    return "System role with protected access configuration."
  }

  return `${role.permissions_count} permission${
    role.permissions_count === 1 ? "" : "s"
  } assigned to this role.`
}

function getRoleScope(role: Role) {
  if (role.type === "SYSTEM") {
    return "System"
  }

  return `${role.permissions_count} permissions`
}

function findRole(roles: Role[], value: string) {
  return roles.find((role) => role.name === value)
}

/** 0–4. Deliberately simple: it guides, it does not gate. */
function scorePassword(password: string) {
  if (!password) return 0

  let score = 0

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1

  return Math.min(score, 4)
}

const STRENGTH_LABELS = [
  "Too short",
  "Weak",
  "Fair",
  "Good",
  "Strong",
]

const STRENGTH_COLORS = [
  "bg-muted",
  "bg-destructive",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-emerald-600",
]

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-6 py-8 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-10">
      <div className="md:pt-0.5">
        <h2 className="text-sm font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>

        {!required && (
          <span className="text-xs text-muted-foreground">
            Optional
          </span>
        )}
      </div>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-sm text-destructive"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="text-xs leading-5 text-muted-foreground"
        >
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Role picker                                                                */
/* -------------------------------------------------------------------------- */

function RolePicker({
  roles,
  loading,
  value,
  onChange,
  onBlur,
  error,
}: {
  roles: Role[]
  loading?: boolean
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}) {
  const [open, setOpen] = useState(false)

  const selected = findRole(roles, value)

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)

          if (!next) onBlur?.()
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id="role"
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "role-error" : undefined}
            disabled={loading}
            className={`
              h-auto w-full justify-between px-3 py-2.5 font-normal
              ${error ? "border-destructive" : ""}
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading roles...
              </span>
            ) : selected ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {formatRoleName(selected.name)}
                </span>

                <Badge
                  variant="secondary"
                  className="shrink-0 font-normal"
                >
                  {getRoleScope(selected)}
                </Badge>
              </span>
            ) : (
              <span className="text-muted-foreground">
                Choose a role
              </span>
            )}

            <ChevronsUpDown
              aria-hidden="true"
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
        >
          <Command
            filter={(itemValue, search) =>
              itemValue
                .toLowerCase()
                .includes(search.toLowerCase())
                ? 1
                : 0
            }
          >
            <CommandInput
              placeholder="Search roles"
              className="h-9"
            />

            <CommandList>
              <CommandEmpty className="px-4 py-6 text-center text-sm text-muted-foreground">
                No roles match your search.
              </CommandEmpty>

              <CommandGroup>
                {roles.map((role) => {
                  const label = formatRoleName(role.name)
                  const description = getRoleDescription(role)
                  const scope = getRoleScope(role)

                  return (
                    <CommandItem
                      key={role.id}
                      value={`${role.name} ${label} ${scope} ${description}`}
                      onSelect={() => {
                        onChange(role.name)
                        setOpen(false)
                      }}
                      className="items-start gap-2 py-2"
                    >
                      <Check
                        aria-hidden="true"
                        className={`
                          mt-0.5 h-4 w-4 shrink-0
                          ${
                            role.name === value
                              ? "opacity-100"
                              : "opacity-0"
                          }
                        `}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {label}
                          </span>

                          <Badge
                            variant={
                              role.type === "SYSTEM"
                                ? "default"
                                : "secondary"
                            }
                            className="shrink-0 text-[10px] font-normal"
                          >
                            {role.type}
                          </Badge>
                        </div>

                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                          {description}
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {role.users_count}{" "}
                          {role.users_count === 1
                            ? "user"
                            : "users"}{" "}
                          · {role.permissions_count}{" "}
                          {role.permissions_count === 1
                            ? "permission"
                            : "permissions"}
                        </p>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error ? (
        <p
          id="role-error"
          role="alert"
          className="flex items-start gap-1.5 text-sm text-destructive"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          {error}
        </p>
      ) : selected ? (
        <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          />

          <p className="text-xs leading-5 text-muted-foreground">
            {getRoleDescription(selected)}
          </p>
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Password input                                                             */
/* -------------------------------------------------------------------------- */

function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  invalid,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  invalid?: boolean
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="new-password"
        className="pr-10"
        aria-invalid={invalid}
        aria-describedby={
          invalid ? `${id}-error` : undefined
        }
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="
          absolute right-2 top-1/2 -translate-y-1/2 rounded p-1
          text-muted-foreground transition-colors hover:text-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        "
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Eye aria-hidden="true" className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function UserFormPage() {
  const router = useRouter()
  const params = useParams()

  const userId =
    typeof params?.id === "string" ? params.id : undefined

  const locale =
    typeof params?.locale === "string" ? params.locale : "or"

  const usersUrl = `/${locale}/dashboard/administration/users`

  const isEditMode = Boolean(userId)

  /* ---------------------------------------------------------------------- */
  /* Server roles                                                           */
  /* ---------------------------------------------------------------------- */

  const {
    data: roles = [],
    isLoading: isRolesLoading,
    isError: isRolesError,
  } = useRoles({
    per_page: 100,
    sort_by: "name",
    sort_direction: "asc",
  })

  /*
   * Confirmed API envelope for GET roles:
   *
   * {
   *   success: true,
   *   message: "Roles retrieved successfully.",
   *   data: [
   *     {
   *       id, name, guard_name, type,
   *       users_count, permissions_count,
   *       created_at, updated_at
   *     },
   *     ...
   *   ],
   *   meta: { timestamp, request_id, version, pagination }
   * }
   *
   * `useRoles` currently resolves `data` to the *full envelope* above rather
   * than the unwrapped Role[] array — confirmed by logging `roles`, which
   * comes back as { success, message, data, meta }, not an array. Unwrapping
   * belongs in the hook long-term, but this component unwraps defensively
   * here so it works whether the hook returns the envelope, the bare array,
   * or (briefly) undefined while loading.
   */
  const availableRoles = useMemo(() => {
    if (Array.isArray(roles)) return roles

    if (
      roles &&
      typeof roles === "object" &&
      Array.isArray((roles as { data?: unknown }).data)
    ) {
      return (roles as { data: Role[] }).data
    }

    return []
  }, [roles])

  /* ---------------------------------------------------------------------- */
  /* Existing user (edit mode)                                              */
  /* ---------------------------------------------------------------------- */

  const {
    data: existingUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUser(userId)

  /* ---------------------------------------------------------------------- */
  /* Mutations                                                              */
  /* ---------------------------------------------------------------------- */

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const updateUserStatus = useUpdateUserStatus()
  const resetUserPassword = useResetUserPassword()
  const assignUserRoles = useAssignUserRoles()

  /* ---------------------------------------------------------------------- */
  /* Initial form                                                           */
  /* ---------------------------------------------------------------------- */

  const initialForm = useMemo<UserFormData>(
    () => ({
      name: "",
      email: "",
      phone: "",
      role: "",
      status: "ACTIVE",
      password: "",
      passwordConfirmation: "",
    }),
    [],
  )

  /* ---------------------------------------------------------------------- */
  /* State                                                                  */
  /* ---------------------------------------------------------------------- */

  const [form, setForm] =
    useState<UserFormData>(initialForm)

  const [errors, setErrors] = useState<
    Partial<Record<FormField, string>>
  >({})

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [changingPassword, setChangingPassword] =
    useState(!isEditMode)

  /*
   * The last known-saved (or freshly loaded) snapshot of the form. For a
   * new user this stays equal to `initialForm`. For an existing user it's
   * replaced once `existingUser` arrives, below — so "unsaved changes" and
   * the per-section dirty checks in handleSubmit compare against what's
   * actually on the server, not against blank fields.
   */
  const [baseline, setBaseline] =
    useState<UserFormData>(initialForm)

  const formRef = useRef<HTMLFormElement>(null)

  const selectedRole = useMemo(
    () => findRole(availableRoles, form.role),
    [availableRoles, form.role],
  )

  const isDirty = useMemo(
    () =>
      (Object.keys(baseline) as FormField[]).some(
        (key) => form[key] !== baseline[key],
      ),
    [form, baseline],
  )

  const strength = scorePassword(form.password)

  /* ---------------------------------------------------------------------- */
  /* Populate the form once the existing user loads (edit mode)            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!existingUser) return

    /*
     * ASSUMPTION: `is_active` and `name`/`email` are confirmed on `User`
     * (they're referenced directly elsewhere, e.g. in the mutation hooks'
     * success toasts). `phone` and how the assigned role is represented
     * (`roles[0].name` vs a flat `role` field) are NOT confirmed — this
     * reads both defensively. Adjust to match the real `User` type once
     * you can check it.
     */
    const userWithUnconfirmedFields =
      existingUser as unknown as User & {
        phone?: string
        role?: string
        roles?: { name: string }[]
      }

    const mapped: UserFormData = {
      name: existingUser.name ?? "",
      email: existingUser.email ?? "",
      phone: userWithUnconfirmedFields.phone ?? "",
      role:
        userWithUnconfirmedFields.roles?.[0]?.name ??
        userWithUnconfirmedFields.role ??
        "",
      status: existingUser.is_active
        ? "ACTIVE"
        : "INACTIVE",
      password: "",
      passwordConfirmation: "",
    }

    setForm(mapped)
    setBaseline(mapped)
  }, [existingUser])

  /* ---------------------------------------------------------------------- */
  /* Guard against losing work                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!isDirty || isSubmitting) return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handler)

    return () =>
      window.removeEventListener("beforeunload", handler)
  }, [isDirty, isSubmitting])

  /* ---------------------------------------------------------------------- */
  /* Field updates                                                          */
  /* ---------------------------------------------------------------------- */

  const updateField = useCallback(
    <K extends FormField>(
      field: K,
      value: UserFormData[K],
    ) => {
      setForm((current) => ({
        ...current,
        [field]: value,
      }))

      setErrors((current) => {
        if (!current[field]) return current

        const next = { ...current }
        delete next[field]

        return next
      })
    },
    [],
  )

  /* ---------------------------------------------------------------------- */
  /* Validation                                                             */
  /* ---------------------------------------------------------------------- */

  const validate = useCallback(
    (data: UserFormData) => {
      const next: Partial<Record<FormField, string>> = {}

      if (!data.name.trim()) {
        next.name = "Enter the user's full name."
      }

      if (!data.email.trim()) {
        next.email = "Enter an email address."
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
      ) {
        next.email =
          "That doesn't look like an email address. Check for a missing @ or domain."
      }

      if (!data.role) {
        next.role = "Choose the role this user will have."
      } else if (
        availableRoles.length > 0 &&
        !availableRoles.some(
          (role) => role.name === data.role,
        )
      ) {
        next.role =
          "The selected role is no longer available. Choose another role."
      }

      const passwordRequired =
        !isEditMode || changingPassword

      if (passwordRequired && !data.password) {
        next.password = "Set a password for this account."
      } else if (
        data.password &&
        data.password.length < 8
      ) {
        next.password = "Use at least 8 characters."
      }

      if (
        (passwordRequired || data.password) &&
        data.password !== data.passwordConfirmation
      ) {
        next.passwordConfirmation =
          "The two passwords don't match."
      }

      return next
    },
    [
      isEditMode,
      changingPassword,
      availableRoles,
    ],
  )

  const validateField = (field: FormField) => {
    const result = validate(form)

    setErrors((current) => ({
      ...current,
      ...(result[field]
        ? { [field]: result[field] }
        : { [field]: undefined }),
    }))
  }

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async (
    event?: FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault()

    const nextErrors = validate(form)

    setErrors(nextErrors)

    const firstError = (
      Object.keys(nextErrors) as FormField[]
    ).find((key) => nextErrors[key])

    if (firstError) {
      const target =
        formRef.current?.querySelector<HTMLElement>(
          `#${firstError}`,
        )

      target?.focus()

      target?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })

      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && userId) {
        /*
         * Edit mode: only call the mutations for sections that actually
         * changed, each against its own endpoint per the hooks file
         * ("Roles, password and account status are handled by their
         * dedicated mutations").
         */

        const profileChanged =
          form.name !== baseline.name ||
          form.email !== baseline.email ||
          form.phone !== baseline.phone

        const roleChanged = form.role !== baseline.role

        const statusChanged =
          form.status !== baseline.status

        const passwordChanged =
          changingPassword && form.password.length > 0

        const tasks: Promise<unknown>[] = []

        if (profileChanged) {
          tasks.push(
            updateUser.mutateAsync({
              userId,
              data: {
                name: form.name,
                email: form.email,
                phone: form.phone || undefined,
              },
            }),
          )
        }

        if (roleChanged) {
          /*
           * Confirmed shape per the hooks file: { roles: string[] }. The
           * role picker here is single-select, so it's sent as a
           * one-item array.
           */
          tasks.push(
            assignUserRoles.mutateAsync({
              userId,
              data: { roles: [form.role] },
            }),
          )
        }

        if (statusChanged) {
          /*
           * Confirmed shape per the hooks file: { is_active: boolean }.
           */
          tasks.push(
            updateUserStatus.mutateAsync({
              userId,
              data: {
                is_active: form.status === "ACTIVE",
              },
            }),
          )
        }

        if (passwordChanged) {
          /*
           * ASSUMPTION: `ResetUserPasswordRequest`'s field names aren't
           * confirmed here — adjust `password` / `password_confirmation`
           * if the backend expects different keys.
           */
          tasks.push(
            resetUserPassword.mutateAsync({
              userId,
              data: {
                password: form.password,
                password_confirmation:
                  form.passwordConfirmation,
              },
            }),
          )
        }

        await Promise.all(tasks)
      } else {
        /*
         * ASSUMPTION: `CreateUserRequest`'s field names aren't confirmed
         * here, particularly `roles` (vs a singular `role`) and
         * `is_active` (vs the backend defaulting new users to active).
         * Adjust to match the real request type.
         */
        await createUser.mutateAsync({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          roles: [form.role],
          is_active: form.status === "ACTIVE",
          password_confirmation:form.passwordConfirmation
        })
      }

      router.push(usersUrl)
      router.refresh()
    } catch {
      /*
       * Each mutation already surfaces its own error toast via its
       * `onError` handler (see the hooks file), so there's nothing
       * further to show here — just stay on the page so the person can
       * fix the problem and retry.
       */
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Keyboard shortcut                                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "s" &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        void handleSubmit()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () =>
      window.removeEventListener("keydown", onKeyDown)
  })

  /* ---------------------------------------------------------------------- */
  /* Cancel                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleCancel = () => {
    if (isDirty) {
      const leave = window.confirm(
        "Leave without saving? Your changes will be lost.",
      )

      if (!leave) return
    }

    router.push(usersUrl)
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-4xl pb-24"
    >
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}

      <header className="flex flex-wrap items-center gap-3 py-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          aria-label="Back to users"
          className="shrink-0"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
          />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {isEditMode
              ? form.name || "Edit user"
              : "New user"}
          </h1>

          <p className="mt-0.5 text-sm text-muted-foreground">
            {isEditMode
              ? "Changes take effect the next time this person signs in."
              : "Set up an account and choose what this person can reach."}
          </p>
        </div>

        {isDirty && (
          <Badge
            variant="secondary"
            className="shrink-0 font-normal"
          >
            Unsaved changes
          </Badge>
        )}
      </header>

      {isEditMode && isUserError && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
            />

            <div>
              <p className="text-sm font-medium">
                Unable to load this user
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Their details could not be retrieved from
                the server. Please refresh the page and
                try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditMode && isUserLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          <Loader2
            aria-hidden="true"
            className="h-4 w-4 animate-spin"
          />
          Loading this user's details...
        </div>
      )}

      <Card>
        <CardContent className="divide-y px-6 py-0">
          {/* ------------------------------------------------------------ */}
          {/* Identity                                                      */}
          {/* ------------------------------------------------------------ */}

          <FormSection
            title="Identity"
            description="How this person is identified across the system and contacted about their account."
          >
            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="text-sm font-medium">
                  {getInitials(form.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {form.name || "No name yet"}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {selectedRole
                    ? formatRoleName(selectedRole.name)
                    : "No role assigned"}
                </p>
              </div>
            </div>

            <Field
              id="name"
              label="Full name"
              required
              error={errors.name}
            >
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                onBlur={() => validateField("name")}
                placeholder="Abebe Kebede"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name
                    ? "name-error"
                    : undefined
                }
              />
            </Field>

            <Field
              id="email"
              label="Email address"
              required
              hint="Used to sign in and to receive account notices."
              error={errors.email}
            >
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
                onBlur={() => validateField("email")}
                placeholder="name@adama.gov.et"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email
                    ? "email-error"
                    : "email-hint"
                }
              />
            </Field>

            <Field
              id="phone"
              label="Phone number"
              hint="Only used if someone needs to reach this person about their account."
            >
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value,
                  )
                }
                placeholder="+251 9X XXX XXXX"
                autoComplete="tel"
                aria-describedby="phone-hint"
              />
            </Field>
          </FormSection>

          {/* ------------------------------------------------------------ */}
          {/* Access                                                        */}
          {/* ------------------------------------------------------------ */}

          <FormSection
            title="Access"
            description="The role determines the permissions assigned to this user."
          >
            <Field
              id="role"
              label="Role"
              required
              error={errors.role}
            >
              {isRolesError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Unable to load roles
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        The available roles could not be
                        retrieved from the server. Please
                        refresh the page and try again.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <RolePicker
                  roles={availableRoles}
                  loading={isRolesLoading}
                  value={form.role}
                  onChange={(value) =>
                    updateField("role", value)
                  }
                  onBlur={() => validateField("role")}
                  error={errors.role}
                />
              )}
            </Field>

            <Separator />

            <Field
              id="status"
              label="Account status"
              hint={
                form.status === "ACTIVE"
                  ? "This person can sign in."
                  : "This person keeps their account but cannot sign in."
              }
            >
              <Select
                value={form.status}
                onValueChange={(value) =>
                  updateField(
                    "status",
                    value as UserStatus,
                  )
                }
              >
                <SelectTrigger
                  id="status"
                  className="sm:max-w-xs"
                  aria-describedby="status-hint"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ACTIVE">
                    Active
                  </SelectItem>

                  <SelectItem value="INACTIVE">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FormSection>

          {/* ------------------------------------------------------------ */}
          {/* Password                                                      */}
          {/* ------------------------------------------------------------ */}

          <FormSection
            title="Password"
            description={
              isEditMode
                ? "Set a new password only if this person has lost access to their account."
                : "Share this password with the person directly. Ask them to change it after they sign in."
            }
          >
            {isEditMode && !changingPassword ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                  />

                  <p className="text-sm text-muted-foreground">
                    The current password stays in place.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setChangingPassword(true)
                  }
                >
                  Set a new password
                </Button>
              </div>
            ) : (
              <>
                <Field
                  id="password"
                  label={
                    isEditMode
                      ? "New password"
                      : "Password"
                  }
                  required
                  error={errors.password}
                >
                  <PasswordInput
                    id="password"
                    value={form.password}
                    onChange={(value) =>
                      updateField(
                        "password",
                        value,
                      )
                    }
                    onBlur={() =>
                      validateField("password")
                    }
                    placeholder="At least 8 characters"
                    invalid={Boolean(
                      errors.password,
                    )}
                  />

                  {form.password && (
                    <div className="space-y-1.5 pt-1">
                      <div
                        className="flex gap-1"
                        aria-hidden="true"
                      >
                        {[1, 2, 3, 4].map(
                          (step) => (
                            <span
                              key={step}
                              className={`
                                h-1 flex-1 rounded-full transition-colors
                                ${
                                  step <= strength
                                    ? STRENGTH_COLORS[
                                        strength
                                      ]
                                    : "bg-muted"
                                }
                              `}
                            />
                          ),
                        )}
                      </div>

                      <p
                        aria-live="polite"
                        className="text-xs text-muted-foreground"
                      >
                        {STRENGTH_LABELS[strength]}

                        {strength < 3 &&
                          " — mix in capitals, numbers, or symbols."}
                      </p>
                    </div>
                  )}
                </Field>

                <Field
                  id="passwordConfirmation"
                  label="Confirm password"
                  required
                  error={
                    errors.passwordConfirmation
                  }
                >
                  <PasswordInput
                    id="passwordConfirmation"
                    value={
                      form.passwordConfirmation
                    }
                    onChange={(value) =>
                      updateField(
                        "passwordConfirmation",
                        value,
                      )
                    }
                    onBlur={() =>
                      validateField(
                        "passwordConfirmation",
                      )
                    }
                    placeholder="Type it again"
                    invalid={Boolean(
                      errors.passwordConfirmation,
                    )}
                  />
                </Field>

                {isEditMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2"
                    onClick={() => {
                      setChangingPassword(false)

                      updateField(
                        "password",
                        "",
                      )

                      updateField(
                        "passwordConfirmation",
                        "",
                      )
                    }}
                  >
                    Keep the current password
                  </Button>
                )}
              </>
            )}
          </FormSection>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Actions                                                          */}
      {/* ---------------------------------------------------------------- */}

      <div
        className="
          sticky bottom-0 z-10 mt-4 flex flex-col-reverse items-stretch
          gap-3 border-t bg-background/95 py-4 backdrop-blur
          supports-[backdrop-filter]:bg-background/80
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <p className="text-xs text-muted-foreground sm:pl-1">
          {selectedRole
            ? `${formatRoleName(selectedRole.name)} · ${getRoleScope(selectedRole)}`
            : isRolesLoading
              ? "Loading roles..."
              : "No role chosen yet"}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (isEditMode && !isDirty) ||
              (isEditMode &&
                (isUserLoading || isUserError)) ||
              isRolesLoading ||
              isRolesError ||
              availableRoles.length === 0
            }
          >
            {isSubmitting ? (
              <Loader2
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
              />
            ) : (
              <Save
                aria-hidden="true"
                className="mr-2 h-4 w-4"
              />
            )}

            {isSubmitting
              ? "Saving"
              : isEditMode
                ? "Save changes"
                : "Create user"}
          </Button>
        </div>
      </div>
    </form>
  )
}