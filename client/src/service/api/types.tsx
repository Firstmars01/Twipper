export const API_BASE = "/api";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    bio?: string;
    avatar?: string;
    flag?: string;
    createdAt?: string;
  };
  token: string;
  refreshToken: string;
}

export interface ApiError {
  error: string;
}
