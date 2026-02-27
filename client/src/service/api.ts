const API_BASE = "/api";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    bio?: string;
    avatar?: string;
    createdAt?: string;
  };
  token: string;
}

export interface ApiError {
  error: string;
}

// --- Auth ---

export async function apiRegister(
  email: string,
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok) {
    const body: ApiError = await res.json();
    throw new Error(body.error || "Erreur lors de l'inscription");
  }

  return res.json();
}

export async function apiLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body: ApiError = await res.json();
    throw new Error(body.error || "Erreur lors de la connexion");
  }

  return res.json();
}

export async function apiGetMe(token: string): Promise<{ user: AuthResponse["user"] }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Non authentifié");
  }

  return res.json();
}

// --- Helpers ---

export function saveAuth(data: AuthResponse) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getStoredUser(): AuthResponse["user"] | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
