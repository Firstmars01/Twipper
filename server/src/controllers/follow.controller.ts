import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/users/:username/follow
export async function followUser(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.userId!;
    const { username } = req.params;

    // Trouver l'utilisateur cible
    const target = await prisma.user.findUnique({ where: { username } });

    if (!target) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    if (target.id === currentUserId) {
      res.status(400).json({ error: "Vous ne pouvez pas vous follow vous-même" });
      return;
    }

    // Vérifier si déjà follow
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: target.id,
        },
      },
    });

    if (existing) {
      res.status(409).json({ error: "Vous suivez déjà cet utilisateur" });
      return;
    }

    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: target.id,
      },
    });

    res.status(201).json({ message: "Utilisateur suivi avec succès" });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// DELETE /api/users/:username/follow
export async function unfollowUser(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.userId!;
    const { username } = req.params;

    const target = await prisma.user.findUnique({ where: { username } });

    if (!target) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: target.id,
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Vous ne suivez pas cet utilisateur" });
      return;
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: target.id,
        },
      },
    });

    res.json({ message: "Vous ne suivez plus cet utilisateur" });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/users/:username/followers
export async function getFollowers(req: AuthRequest, res: Response) {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            bio: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users: followers.map((f: any) => f.follower) });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/users/:username/following
export async function getFollowing(req: AuthRequest, res: Response) {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            bio: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users: following.map((f: any) => f.following) });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
