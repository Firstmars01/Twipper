import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { findUserByUsername, USER_PUBLIC_SELECT } from "../helpers/user.helper";
import { findExistingFollow, createFollow, deleteFollow } from "../helpers/follow.helper";

// POST /api/users/:username/follow
export async function followUser(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.userId!;
    const username = req.params.username as string;
    const target = await findUserByUsername(username);

    if (!target) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    if (target.id === currentUserId) {
      res.status(400).json({ error: "Vous ne pouvez pas vous follow vous-même" });
      return;
    }

    if (await findExistingFollow(currentUserId, target.id)) {
      res.status(409).json({ error: "Vous suivez déjà cet utilisateur" });
      return;
    }

    await createFollow(currentUserId, target.id);
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
    const username = req.params.username as string;
    const target = await findUserByUsername(username);

    if (!target) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    if (!(await findExistingFollow(currentUserId, target.id))) {
      res.status(404).json({ error: "Vous ne suivez pas cet utilisateur" });
      return;
    }

    await deleteFollow(currentUserId, target.id);
    res.json({ message: "Vous ne suivez plus cet utilisateur" });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/users/:username/followers
export async function getFollowers(req: AuthRequest, res: Response) {
  try {
    const username = req.params.username as string;
    const user = await findUserByUsername(username);

    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: { follower: { select: USER_PUBLIC_SELECT } },
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
    const username = req.params.username as string;
    const user = await findUserByUsername(username);

    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: { following: { select: USER_PUBLIC_SELECT } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users: following.map((f: any) => f.following) });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
