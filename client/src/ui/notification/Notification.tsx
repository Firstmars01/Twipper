import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import {
  apiGetNotifications,
  apiGetUnreadCount,
  apiMarkAllAsRead,
  isAuthenticated,
} from "../../service/api";
import type { Notification as NotifType } from "../../service/api";
import "./Style.css";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotifType[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const count = await apiGetUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const notifs = await apiGetNotifications();
      setNotifications(notifs);
    } catch {
      // silently fail
    }
  }, []);

  // Poll unread count every 15s
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleMarkAllRead() {
    try {
      await apiMarkAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  }

  function handleNotifClick(notif: NotifType) {
    if (notif.type === "follow") {
      navigate(`/profile/${notif.fromUsername}`);
    }
    setOpen(false);
  }

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button className="notification-bell" onClick={() => setOpen((o) => !o)} title="Notifications">
        <FaBell />
      </button>

      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="notification-mark-read" onClick={handleMarkAllRead}>
                Tout marquer lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">Aucune notification</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.read ? "unread" : ""}`}
                onClick={() => handleNotifClick(notif)}
              >
                <div className="notification-avatar">
                  {notif.fromAvatar ? (
                    <img src={notif.fromAvatar} alt={notif.fromUsername} />
                  ) : (
                    notif.fromUsername.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="notification-content">
                  <p className="notification-text">
                    <strong>@{notif.fromUsername}</strong> a commencé à vous suivre
                  </p>
                  <p className="notification-time">{timeAgo(notif.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
