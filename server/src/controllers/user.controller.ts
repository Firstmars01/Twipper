import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

// GET /api/users/:username
export async function getUserByUsername(req: Request, res: Response) {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          tweets: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  // Vérifier si l'utilisateur connecté suit ce profil
  let isFollowing = false;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const token = header.split(" ")[1];
      const secret = process.env.JWT_SECRET || "default_secret";
      const decoded = jwt.verify(token, secret) as { userId: string };
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: decoded.userId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    } catch {
      // Token invalide → on ignore, isFollowing reste false
    }
  }

  res.json({ user: { ...user, isFollowing } });
}
