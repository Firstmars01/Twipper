import { API_BASE } from "./types";
import { fetchWithAuth } from "./http";

export interface Tweet {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  _count: {
    likes: number;
  };
}

// POST /api/tweets
export async function apiCreateTweet(content: string): Promise<Tweet> {
  const res = await fetchWithAuth(`${API_BASE}/tweets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de la création du tweet");
  return data;
}

// GET /api/tweets/feed
export async function apiGetFeed(page = 1, limit = 20): Promise<Tweet[]> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/feed?page=${page}&limit=${limit}`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du chargement du fil");
  return data;
}

// PUT /api/tweets/:id
export async function apiUpdateTweet(id: string, content: string): Promise<Tweet> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de la modification du tweet");
  return data;
}

// DELETE /api/tweets/:id
export async function apiDeleteTweet(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de la suppression");
  }
}
