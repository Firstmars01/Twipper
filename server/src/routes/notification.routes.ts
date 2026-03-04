import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
} from "../controllers/notification.controller";

export const notificationRouter = Router();

notificationRouter.get("/", authMiddleware, getNotifications);
notificationRouter.get("/unread-count", authMiddleware, getUnreadCount);
notificationRouter.patch("/read-all", authMiddleware, markAllAsRead);
