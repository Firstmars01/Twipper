import { API_BASE } from "./types";
import { fetchWithAuth } from "./http";

// POST /api/users/:username/follow
export async function apiFollowUser(username: string): Promise<void> {
  const res = await fetchWithAuth(
    `${API_BASE}/users/${encodeURIComponent(username)}/follow`,
    { method: "POST" }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Erreur lors du follow");
  }
}

// DELETE /api/users/:username/follow
export async function apiUnfollowUser(username: string): Promise<void> {
  const res = await fetchWithAuth(
    `${API_BASE}/users/${encodeURIComponent(username)}/follow`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Erreur lors du unfollow");
  }
}

// GET /api/users/:username/followers
export async function apiGetFollowers(username: string) {
  const res = await fetchWithAuth(`${API_BASE}/users/${encodeURIComponent(username)}/followers`);

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des abonnés");
  }

  const data = await res.json();
  return data.users as { id: string; username: string; bio?: string; avatar?: string }[];
}

// GET /api/users/:username/following
export async function apiGetFollowing(username: string) {
  const res = await fetchWithAuth(`${API_BASE}/users/${encodeURIComponent(username)}/following`);

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des abonnements");
  }

  const data = await res.json();
  return data.users as { id: string; username: string; bio?: string; avatar?: string }[];
}
