export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: Record<string, boolean>;
}
