import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import type { AuthRequest } from "../middleware/auth.middleware";

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
      flag: true,
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

// PUT /api/users/me — update own profile (username, bio)
export async function updateProfile(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const { username, bio, flag } = req.body;

  // Validation basique
  if (username !== undefined) {
    if (typeof username !== "string" || username.trim().length < 3) {
      res.status(400).json({ error: "Le nom d'utilisateur doit contenir au moins 3 caractères" });
      return;
    }
    if (username.trim().length > 20) {
      res.status(400).json({ error: "Le nom d'utilisateur ne doit pas dépasser 20 caractères" });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      res.status(400).json({ error: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores" });
      return;
    }
  }

  if (bio !== undefined && typeof bio !== "string") {
    res.status(400).json({ error: "La bio doit être une chaîne de caractères" });
    return;
  }

  // Vérifier unicité du username si modifié
  if (username !== undefined) {
    const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existing && existing.id !== userId) {
      res.status(409).json({ error: "Ce nom d'utilisateur est déjà pris" });
      return;
    }
  }

  if (flag !== undefined && typeof flag !== "string") {
    res.status(400).json({ error: "Le flag doit être une chaîne de caractères" });
    return;
  }

  const data: Record<string, string | null> = {};
  if (username !== undefined) data.username = username.trim();
  if (bio !== undefined) data.bio = bio.trim() || null;
  if (flag !== undefined) data.flag = flag.trim() || null;

  const updated = await prisma.user.update({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      flag: true,
      createdAt: true,
    },
  data,
  });

  res.json({ user: updated });
}
