import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/tweets
export async function createTweet(req: AuthRequest, res: Response) {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Le contenu du tweet est requis" });
      return;
    }

    if (content.length > 280) {
      res.status(400).json({ error: "Le tweet ne peut pas dépasser 280 caractères" });
      return;
    }

    const tweet = await prisma.tweet.create({
      data: {
        content: content.trim(),
        authorId: req.userId!,
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true } },
      },
    });

    res.status(201).json(tweet);
  } catch (error) {
    console.error("Create tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/tweets  (fil d'actualité : tweets de l'utilisateur + ceux qu'il suit)
export async function getFeed(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Récupérer les IDs des utilisateurs suivis
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f: { followingId: string }) => f.followingId);

    // Tweets de l'utilisateur + ceux qu'il suit
    const tweets = await prisma.tweet.findMany({
      where: {
        authorId: { in: [userId, ...followingIds] },
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    res.json(tweets);
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/tweets/user/:username
export async function getUserTweets(req: AuthRequest, res: Response) {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const tweets = await prisma.tweet.findMany({
      where: { authorId: user.id },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    res.json(tweets);
  } catch (error) {
    console.error("Get user tweets error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// PUT /api/tweets/:id
export async function updateTweet(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Le contenu du tweet est requis" });
      return;
    }

    if (content.length > 280) {
      res.status(400).json({ error: "Le tweet ne peut pas dépasser 280 caractères" });
      return;
    }

    const tweet = await prisma.tweet.findUnique({ where: { id } });

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
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// DELETE /api/tweets/:id
export async function deleteTweet(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const tweet = await prisma.tweet.findUnique({ where: { id } });

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
