export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Viewer';
  department: string;
  status: 'Active' | 'Inactive' | 'Pending';
  avatar?: string | null;
  phone?: string | null;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface UserListResponse {
  success: boolean;
  count: number;
  users: User[];
}
