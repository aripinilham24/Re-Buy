export interface RegisterTypeProps {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginTypeProps {
   email: string;
   password: string;
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  profile: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}