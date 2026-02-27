import { API_BASE, type AuthResponse } from "./types";
import { fetchWithAuth } from "./http";

// GET /api/users/:username
export async function apiGetUserByUsername(username: string) {
  const res = await fetchWithAuth(`${API_BASE}/users/${encodeURIComponent(username)}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération du profil");
  }

  const data = await res.json();
  return data.user as AuthResponse["user"] & {
    _count: { tweets: number; followers: number; following: number };
    isFollowing: boolean;
  };
}
