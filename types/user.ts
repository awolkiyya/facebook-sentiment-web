/**
 * ============================================================================
 * USER STATUS
 * ============================================================================
 *
 * Derived from the backend `is_active` field.
 *
 * The backend currently stores only ACTIVE / INACTIVE.
 * SUSPENDED and BLOCKED should not be introduced unless the backend
 * explicitly supports those states.
 * ============================================================================
 */

export type UserStatus = "ACTIVE" | "INACTIVE";

/**
 * ============================================================================
 * PERMISSION ACTIONS
 * ============================================================================
 *
 * These are the actions used by the frontend permission system.
 *
 * Backend examples:
 *
 *     users.view
 *     users.create
 *     users.update
 *     users.delete
 *     users.update_status
 *     users.reset_password
 *     users.unlock
 *     users.assign_roles
 * ============================================================================
 */

export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "manage"
  | "update_status"
  | "reset_password"
  | "unlock"
  | "assign_roles";

/**
 * ============================================================================
 * USER PERMISSION
 * ============================================================================
 *
 * Example:
 *
 * {
 *   resource: "users",
 *   actions: ["view", "create", "update"]
 * }
 * ============================================================================
 */

export interface UserPermission {
  resource: string;
  actions: PermissionAction[];
}

/**
 * ============================================================================
 * USER ROLE
 * ============================================================================
 *
 * Roles come from the backend database.
 *
 * Do NOT hard-code role names such as:
 *
 *     SYSTEM_ADMIN
 *     MAYOR
 *
 * ============================================================================
 */

export interface UserRole {
  id: string | number;
  name: string;
  label?: string | null;
}

/**
 * ============================================================================
 * USER MFA
 * ============================================================================
 */

export interface UserMfa {
  enabled: boolean;
  confirmed_at: string | null;
}

/**
 * ============================================================================
 * USER
 * ============================================================================
 *
 * Matches the Laravel UserResource.
 * ============================================================================
 */

export interface User {
  id: string;

  name: string;

  email: string;

  email_verified_at: string | null;

  is_active: boolean;

  last_login_at: string | null;

  mfa: UserMfa;

  roles?: UserRole[];

  created_at: string;

  updated_at: string;
}

/**
 * ============================================================================
 * AUTH USER
 * ============================================================================
 *
 * This represents the currently authenticated user.
 *
 * Keep this separate from the User Management resource because the
 * authenticated user may contain permissions that are not returned
 * by the normal UserResource.
 * ============================================================================
 */

export interface AuthUser {
  id: string;

  name: string;

  label?: string | null;

  email: string;

  email_verified_at?: string | null;

  is_active: boolean;

  last_login_at?: string | null;

  /*
  |--------------------------------------------------------------------------
  | MFA
  |--------------------------------------------------------------------------
  |
  | Whether this user has successfully configured MFA.
  |
  */

  mfa_enabled: boolean;

  /*
  |--------------------------------------------------------------------------
  | ROLE
  |--------------------------------------------------------------------------
  |
  | Current application role.
  |
  */

  role?: UserRole | null;

  /*
  |--------------------------------------------------------------------------
  | PERMISSIONS
  |--------------------------------------------------------------------------
  */

  permissions?: UserPermission[];

  created_at?: string;

  updated_at?: string;
}



/*
|--------------------------------------------------------------------------
| SECURITY CONTEXT
|--------------------------------------------------------------------------
|
| Authentication/security policy returned by Laravel.
|
| - require_two_factor:
|     Global system policy.
|
| - mfa_setup_required:
|     Derived value indicating that this user must configure MFA
|     before they can complete authentication.
|
*/

export interface AuthSecurity {
  require_two_factor: boolean;
  mfa_setup_required: boolean;
}

/**
 * ============================================================================
 * LOGIN RESPONSE
 * ============================================================================
 */

export interface LoginResponse {
  user: AuthUser;

  access_token: string;

  token_type: string;
}

/**
 * ============================================================================
 * CREATE USER REQUEST
 * ============================================================================
 *
 * The backend currently accepts role names during user creation:
 *
 *     roles: string[]
 *
 * Therefore this must use role names, not role_id.
 *
 * Role IDs can still be used by the UI internally when selecting a role,
 * but the service should convert them to names if the backend contract
 * remains role-name based.
 * ============================================================================
 */

export interface CreateUserRequest {
  name: string;

  email: string;

  password: string;

  phone?:string;

  password_confirmation: string;



  roles?: string[];
  is_active:boolean;
}

/**
 * ============================================================================
 * UPDATE USER REQUEST
 * ============================================================================
 *
 * Profile information only.
 *
 * Password and roles are intentionally excluded.
 *
 * Password is handled through:
 *
 *     POST /users/{user}/reset-password
 *
 * Roles are handled through:
 *
 *     PATCH /users/{user}/roles
 * ============================================================================
 */

export interface UpdateUserRequest {
  name?: string;
  phone?:string;

  email?: string;
}

/**
 * ============================================================================
 * UPDATE USER STATUS REQUEST
 * ============================================================================
 */

export interface UpdateUserStatusRequest {
  is_active: boolean;
}

/**
 * ============================================================================
 * RESET USER PASSWORD REQUEST
 * ============================================================================
 */

export interface ResetUserPasswordRequest {
  password: string;

  password_confirmation: string;
}

/**
 * ============================================================================
 * ASSIGN USER ROLES REQUEST
 * ============================================================================
 */

export interface AssignUserRolesRequest {
  roles: string[];
}

/**
 * ============================================================================
 * USER QUERY PARAMETERS
 * ============================================================================
 */

export interface UserQueryParams {
  page?: number
  per_page?: number
  search?: string
  role?: string
  is_active?: boolean
  sort_by?: string
  sort_direction?: "asc" | "desc"
}

/**
 * ============================================================================
 * USER FORM DATA
 * ============================================================================
 *
 * Used by the create/edit UI.
 *
 * `role_ids` are frontend form values and can be converted into role names
 * before sending the API request.
 * ============================================================================
 */

export interface UserFormData {
  name: string;

  email: string;

  password?: string;

  password_confirmation?: string;

  role_ids: string[];

  is_active: boolean;
}

/**
 * ============================================================================
 * PAGINATION
 * ============================================================================
 */

export interface PaginationMeta {
  current_page: number;

  from: number | null;

  last_page: number;

  per_page: number;

  to: number | null;

  total: number;
}

/**
 * ============================================================================
 * PAGINATED USERS RESPONSE
 * ============================================================================
 */

export interface UsersResponse {
  data: User[];

  links?: {
    first: string | null;

    last: string | null;

    prev: string | null;

    next: string | null;
  };

  meta: PaginationMeta;
}

/**
 * ============================================================================
 * API MESSAGE RESPONSE
 * ============================================================================
 */

export interface ApiMessageResponse {
  message: string;
}
