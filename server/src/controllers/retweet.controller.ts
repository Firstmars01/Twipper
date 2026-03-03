import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { tweetInclude, formatTweet, findTweetById } from "../helpers/tweet.helper";

// POST /api/tweets/:id/retweet
export async function retweetTweet(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const original = await findTweetById(id);
    if (!original) {
      res.status(404).json({ error: "Tweet introuvable" });
      return;
    }

    // On retweete toujours le tweet original, pas un retweet
    const targetId = original.retweetOfId || original.id;

    const existing = await prisma.tweet.findFirst({
      where: { authorId: userId, retweetOfId: targetId },
    });
    if (existing) {
      res.status(409).json({ error: "Vous avez déjà retweeté ce tweet" });
      return;
    }

    const retweet = await prisma.tweet.create({
      data: { content: "", authorId: userId, retweetOfId: targetId },
      include: tweetInclude(userId),
    });

    res.status(201).json(formatTweet(retweet));
  } catch (error) {
    console.error("Retweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// DELETE /api/tweets/:id/retweet
export async function unretweetTweet(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const retweet = await prisma.tweet.findFirst({
      where: { authorId: userId, retweetOfId: id },
    });

    if (!retweet) {
      res.status(404).json({ error: "Retweet introuvable" });
      return;
    }

    await prisma.tweet.delete({ where: { id: retweet.id } });
    res.json({ message: "Retweet supprimé" });
  } catch (error) {
    console.error("Unretweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
