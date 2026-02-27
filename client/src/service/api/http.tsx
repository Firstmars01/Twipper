import { API_BASE, type AuthResponse } from "./types";

// --- Storage helpers ---

export function saveAuth(data: AuthResponse, rememberMe?: boolean) {
  if (rememberMe !== undefined) {
    localStorage.setItem("rememberMe", String(rememberMe));
  }

  const storage = rememberMe === false ? sessionStorage : localStorage;
  storage.setItem("token", data.token);
  storage.setItem("refreshToken", data.refreshToken);
  storage.setItem("user", JSON.stringify(data.user));
}

export function getToken(): string | null {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
}

export function getStoredUser(): AuthResponse["user"] | null {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// --- Refresh token ---

async function apiRefresh(): Promise<AuthResponse> {
  const rt = getRefreshToken();
  if (!rt) throw new Error("Pas de refresh token");

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });

  const body = await res.text();
  let parsed: any;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error("Le serveur ne répond pas correctement");
  }

  if (!res.ok) {
    throw new Error(parsed?.error || "Impossible de rafraîchir la session");
  }

  return parsed;
}

/**
 * fetch authentifié avec refresh automatique.
 * Si le serveur renvoie 401, tente un refresh puis rejoue la requête.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...options, headers });

  // Si 401 → tenter un refresh
  if (res.status === 401) {
    try {
      const data = await apiRefresh();
      saveAuth(data);

      // Rejouer la requête avec le nouveau token
      headers.set("Authorization", `Bearer ${data.token}`);
      res = await fetch(url, { ...options, headers });
    } catch {
      // Refresh échoué → déconnexion
      logout();
      window.location.href = "/login";
      throw new Error("Session expirée, veuillez vous reconnecter");
    }
  }

  return res;
}
