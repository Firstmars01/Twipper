import { API_BASE, type AuthResponse } from "./types";

// POST /api/auth/register
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

  const body = await res.text();
  let parsed: any;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error("Le serveur ne répond pas correctement");
  }

  if (!res.ok) {
    throw new Error(parsed?.error || "Erreur lors de l'inscription");
  }

  return parsed;
}

// POST /api/auth/login
export async function apiLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const loginBody = await res.text();
  let parsed: any;
  try {
    parsed = JSON.parse(loginBody);
  } catch {
    throw new Error("Le serveur ne répond pas correctement");
  }

  if (!res.ok) {
    throw new Error(parsed?.error || "Erreur lors de la connexion");
  }

  return parsed;
}

// GET /api/auth/me
export async function apiGetMe(token: string): Promise<{ user: AuthResponse["user"] }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Non authentifié");
  }

  return res.json();
}
