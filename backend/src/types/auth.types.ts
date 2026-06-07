export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  roleName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUserResponse;
  token: string;
  refreshToken?: string;
}

export interface ChangePasswordInput {
  userId: number;
  currentPassword?: string;
  newPassword?: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword?: string;
}

export interface FirstLoginResetInput {
  userId: number;
  temporaryPassword?: string;
  newPassword?: string;
}
