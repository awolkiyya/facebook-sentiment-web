export type RoleType = "SYSTEM" | "CUSTOM";

export interface RolePermission {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  guard_name: string;

  description: string | null;

  users_count: number;
  permissions_count: number;

  permissions: RolePermission[];

  created_at: string;
  updated_at: string;
}

export interface RoleQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: RoleType;

  sort_by?:
    | "name"
    | "type"
    | "created_at"
    | "updated_at"
    | "users_count"
    | "permissions_count";

  sort_direction?: "asc" | "desc";
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string | null;
  permissions: string[];
}