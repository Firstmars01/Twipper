import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// GET /api/notifications
export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/notifications/unread-count
export async function getUnreadCount(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// PATCH /api/notifications/read-all
export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ message: "Toutes les notifications ont été marquées comme lues" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
