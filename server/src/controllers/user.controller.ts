import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /api/users/:username — Profil public
export async function getProfile(req: Request, res: Response) {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: { select: { tweets: true, followers: true, following: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("GetProfile error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/users/:username/tweets — Tweets d'un utilisateur
export async function getUserTweets(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    const tweets = await prisma.tweet.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true } },
      },
    });

    const total = await prisma.tweet.count({ where: { authorId: user.id } });

    res.json({ tweets, total, page, limit });
  } catch (error) {
    console.error("GetUserTweets error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// POST /api/users/:username/follow — Follow/Unfollow toggle
export async function toggleFollow(req: Request, res: Response) {
  try {
    const followerId = (req as any).userId;
    const { username } = req.params;

    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    if (target.id === followerId) {
      res.status(400).json({ error: "Impossible de se follow soi-même" });
      return;
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: target.id,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      res.json({ following: false });
    } else {
      await prisma.follow.create({
        data: { followerId, followingId: target.id },
      });
      res.json({ following: true });
    }
  } catch (error) {
    console.error("ToggleFollow error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// PUT /api/users/me — Modifier son profil
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { bio, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatar: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
