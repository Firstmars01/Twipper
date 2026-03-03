import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { findTweetById } from "../helpers/tweet.helper";

// POST /api/tweets/:id/like
export async function likeTweet(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const tweet = await findTweetById(id);
    if (!tweet) {
      res.status(404).json({ error: "Tweet introuvable" });
      return;
    }

    const existing = await prisma.like.findUnique({
      where: { userId_tweetId: { userId, tweetId: id } },
    });

    if (existing) {
      res.status(409).json({ error: "Déjà liké" });
      return;
    }

    await prisma.like.create({ data: { userId, tweetId: id } });
    const likesCount = await prisma.like.count({ where: { tweetId: id } });

    res.json({ isLiked: true, likes: likesCount });
  } catch (error) {
    console.error("Like tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// DELETE /api/tweets/:id/like
export async function unlikeTweet(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const existing = await prisma.like.findUnique({
      where: { userId_tweetId: { userId, tweetId: id } },
    });

    if (!existing) {
      res.status(404).json({ error: "Like introuvable" });
      return;
    }

    await prisma.like.delete({ where: { id: existing.id } });
    const likesCount = await prisma.like.count({ where: { tweetId: id } });

    res.json({ isLiked: false, likes: likesCount });
  } catch (error) {
    console.error("Unlike tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
