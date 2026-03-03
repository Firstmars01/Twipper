import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { tweetInclude, formatTweet, validateTweetContent, findTweetById } from "../helpers/tweet.helper";

// POST /api/tweets
export async function createTweet(req: AuthRequest, res: Response) {
  try {
    const { content } = req.body;
    const error = validateTweetContent(content);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const tweet = await prisma.tweet.create({
      data: { content: content.trim(), authorId: req.userId! },
      include: tweetInclude(req.userId!),
    });

    res.status(201).json(formatTweet(tweet));
  } catch (error) {
    console.error("Create tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// PUT /api/tweets/:id
export async function updateTweet(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { content } = req.body;

    const validationError = validateTweetContent(content);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const tweet = await findTweetById(id);
    if (!tweet) {
      res.status(404).json({ error: "Tweet introuvable" });
      return;
    }
    if (tweet.authorId !== req.userId) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    const updated = await prisma.tweet.update({
      where: { id },
      data: { content: content.trim() },
      include: tweetInclude(req.userId!),
    });

    res.json(formatTweet(updated));
  } catch (error) {
    console.error("Update tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// DELETE /api/tweets/:id
export async function deleteTweet(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    const tweet = await findTweetById(id);
    if (!tweet) {
      res.status(404).json({ error: "Tweet introuvable" });
      return;
    }
    if (tweet.authorId !== req.userId) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    await prisma.tweet.delete({ where: { id } });
    res.json({ message: "Tweet supprimé" });
  } catch (error) {
    console.error("Delete tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
