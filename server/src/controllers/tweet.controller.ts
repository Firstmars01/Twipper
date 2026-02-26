import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /api/tweets — Feed (tous les tweets, du plus récent au plus ancien)
export async function getFeed(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const tweets = await prisma.tweet.findMany({
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

    const total = await prisma.tweet.count();

    res.json({ tweets, total, page, limit });
  } catch (error) {
    console.error("GetFeed error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/tweets/:id
export async function getTweet(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const tweet = await prisma.tweet.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!tweet) {
      res.status(404).json({ error: "Tweet non trouvé" });
      return;
    }

    res.json({ tweet });
  } catch (error) {
    console.error("GetTweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// POST /api/tweets
export async function createTweet(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: "Le contenu est requis" });
      return;
    }

    if (content.length > 280) {
      res.status(400).json({ error: "280 caractères maximum" });
      return;
    }

    const tweet = await prisma.tweet.create({
      data: { content: content.trim(), authorId: userId },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true } },
      },
    });

    res.status(201).json({ tweet });
  } catch (error) {
    console.error("CreateTweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// DELETE /api/tweets/:id
export async function deleteTweet(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const tweet = await prisma.tweet.findUnique({ where: { id } });

    if (!tweet) {
      res.status(404).json({ error: "Tweet non trouvé" });
      return;
    }

    if (tweet.authorId !== userId) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    await prisma.tweet.delete({ where: { id } });

    res.json({ message: "Tweet supprimé" });
  } catch (error) {
    console.error("DeleteTweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// POST /api/tweets/:id/like
export async function likeTweet(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id: tweetId } = req.params;

    // Vérifier que le tweet existe
    const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
    if (!tweet) {
      res.status(404).json({ error: "Tweet non trouvé" });
      return;
    }

    // Toggle like : si déjà liké → unlike, sinon → like
    const existingLike = await prisma.like.findUnique({
      where: { userId_tweetId: { userId, tweetId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      res.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId, tweetId } });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error("LikeTweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
