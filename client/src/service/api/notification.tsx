import { API_BASE } from "./types";
import { fetchWithAuth } from "./http";

export interface Notification {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  fromUsername: string;
  fromAvatar?: string;
}

// GET /api/notifications
export async function apiGetNotifications(): Promise<Notification[]> {
  const res = await fetchWithAuth(`${API_BASE}/notifications`);

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des notifications");
  }

  const data = await res.json();
  return data.notifications as Notification[];
}

// GET /api/notifications/unread-count
export async function apiGetUnreadCount(): Promise<number> {
  const res = await fetchWithAuth(`${API_BASE}/notifications/unread-count`);

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération du compteur");
  }

  const data = await res.json();
  return data.count as number;
}

// PATCH /api/notifications/read-all
export async function apiMarkAllAsRead(): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE}/notifications/read-all`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error("Erreur lors du marquage des notifications");
  }
}
