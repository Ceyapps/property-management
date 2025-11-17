import axios from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  User,
  CreateUserDto,
  UpdateUserDto,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: CreateUserDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post<User>('/users', userData);
    return data;
  },

  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
};

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const { data } = await api.get<Role[]>('/roles');
    return data;
  },

  getById: async (id: string): Promise<Role> => {
    const { data} = await api.get<Role>(`/roles/${id}`);
    return data;
  },

  create: async (roleData: CreateRoleDto): Promise<Role> => {
    const { data } = await api.post<Role>('/roles', roleData);
    return data;
  },

  update: async (id: string, roleData: UpdateRoleDto): Promise<Role> => {
    const { data } = await api.patch<Role>(`/roles/${id}`, roleData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};

export default api;
