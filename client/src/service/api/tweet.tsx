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
  isLiked: boolean;
  retweetOfId?: string | null;
  retweetOf?: {
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
    isLiked: boolean;
  } | null;
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

// GET /api/tweets/global
export async function apiGetGlobalFeed(page = 1, limit = 20): Promise<Tweet[]> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/global?page=${page}&limit=${limit}`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du chargement du fil global");
  return data;
}

// GET /api/tweets/trending
export async function apiGetTrendingFeed(page = 1, limit = 20): Promise<Tweet[]> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/trending?page=${page}&limit=${limit}`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du chargement des tendances");
  return data;
}

// GET /api/tweets/user/:username
export async function apiGetUserTweets(username: string, page = 1, limit = 20): Promise<Tweet[]> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/user/${username}?page=${page}&limit=${limit}`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du chargement des tweets");
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

// POST /api/tweets/:id/like
export async function apiLikeTweet(id: string): Promise<{ isLiked: boolean; likes: number }> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/${id}/like`, {
    method: "POST",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du like");
  return data;
}

// DELETE /api/tweets/:id/like
export async function apiUnlikeTweet(id: string): Promise<{ isLiked: boolean; likes: number }> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/${id}/like`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du unlike");
  return data;
}

// POST /api/tweets/:id/retweet
export async function apiRetweetTweet(id: string): Promise<Tweet> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/${id}/retweet`, {
    method: "POST",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du retweet");
  return data;
}

// DELETE /api/tweets/:id/retweet
export async function apiUnretweetTweet(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/${id}/retweet`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de la suppression du retweet");
  }
}
