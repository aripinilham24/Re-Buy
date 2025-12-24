export interface RegisterTypeProps {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginTypeProps {
   username: string;
   password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}