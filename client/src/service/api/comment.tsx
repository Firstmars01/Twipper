import { API_BASE } from "./types";
import { fetchWithAuth } from "./http";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tweetId: string;
  parentId: string | null;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  isLiked: boolean;
  likesCount: number;
}

export interface CommentsResponse {
  data: Comment[];
  total: number;
}

// GET /api/tweets/:tweetId/comments
export async function apiGetComments(tweetId: string, page = 1, limit = 20): Promise<CommentsResponse> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/${tweetId}/comments?page=${page}&limit=${limit}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du chargement des commentaires");
  return data;
}

// POST /api/tweets/:tweetId/comments
export async function apiCreateComment(tweetId: string, content: string, parentId?: string): Promise<Comment> {
  const res = await fetchWithAuth(`${API_BASE}/tweets/${tweetId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, parentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de la création du commentaire");
  return data;
}

// PUT /api/comments/:commentId
export async function apiUpdateComment(commentId: string, content: string): Promise<Comment> {
  const res = await fetchWithAuth(`${API_BASE}/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de la modification du commentaire");
  return data;
}

// DELETE /api/comments/:commentId
export async function apiDeleteComment(commentId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE}/comments/${commentId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de la suppression du commentaire");
  }
}

// POST /api/comments/:commentId/like
export async function apiLikeComment(commentId: string): Promise<{ isLiked: boolean; likesCount: number }> {
  const res = await fetchWithAuth(`${API_BASE}/comments/${commentId}/like`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du like");
  return data;
}

// DELETE /api/comments/:commentId/like
export async function apiUnlikeComment(commentId: string): Promise<{ isLiked: boolean; likesCount: number }> {
  const res = await fetchWithAuth(`${API_BASE}/comments/${commentId}/like`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du unlike");
  return data;
}
