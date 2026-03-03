import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { tweetInclude, formatTweet } from "../helpers/tweet.helper";
import { parsePagination } from "../helpers/pagination.helper";

// GET /api/tweets/feed  (tweets de l'utilisateur + ceux qu'il suit)
export async function getFeed(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { skip, take } = parsePagination(req);

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const authorIds = [userId, ...following.map((f: { followingId: string }) => f.followingId)];

    const tweets = await prisma.tweet.findMany({
      where: { authorId: { in: authorIds } },
      include: tweetInclude(userId),
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    res.json(tweets.map(formatTweet));
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/tweets/global
export async function getGlobalFeed(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { skip, take } = parsePagination(req);

    const tweets = await prisma.tweet.findMany({
      include: tweetInclude(userId),
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    res.json(tweets.map(formatTweet));
  } catch (error) {
    console.error("Get global feed error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/tweets/user/:username
export async function getUserTweets(req: AuthRequest, res: Response) {
  try {
    const username = req.params.username as string;
    const { skip, take } = parsePagination(req);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const tweets = await prisma.tweet.findMany({
      where: { authorId: user.id },
      include: tweetInclude(req.userId!),
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    res.json(tweets.map(formatTweet));
  } catch (error) {
    console.error("Get user tweets error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
