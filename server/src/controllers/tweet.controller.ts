import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// Helper : include commun pour les requêtes tweet
function tweetInclude(userId: string) {
  return {
    author: {
      select: { id: true, username: true, avatar: true },
    },
    _count: { select: { likes: true } },
    likes: {
      where: { userId },
      select: { id: true },
    },
    retweetOf: {
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true } },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
    },
  };
}

// Transforme le résultat Prisma pour ajouter isLiked et retirer le tableau likes
function formatTweet(tweet: any) {
  const { likes, retweetOf, ...rest } = tweet;
  const formatted: any = { ...rest, isLiked: likes.length > 0 };
  if (retweetOf) {
    const { likes: rtLikes, ...rtRest } = retweetOf;
    formatted.retweetOf = { ...rtRest, isLiked: rtLikes.length > 0 };
  } else {
    formatted.retweetOf = null;
  }
  return formatted;
}

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
      include: tweetInclude(req.userId!),
    });

    res.status(201).json(formatTweet(tweet));
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
      include: tweetInclude(userId),
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const tweets = await prisma.tweet.findMany({
      include: tweetInclude(userId),
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
      include: tweetInclude(req.userId!),
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    res.json(tweets.map(formatTweet));
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

// POST /api/tweets/:id/like
export async function likeTweet(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const tweet = await prisma.tweet.findUnique({ where: { id } });
    if (!tweet) {
      res.status(404).json({ error: "Tweet introuvable" });
      return;
    }

    // Vérifier si déjà liké
    const existing = await prisma.like.findUnique({
      where: { userId_tweetId: { userId, tweetId: id } },
    });

    if (existing) {
      res.status(409).json({ error: "Déjà liké" });
      return;
    }

    await prisma.like.create({
      data: { userId, tweetId: id },
    });

    const likesCount = await prisma.like.count({ where: { tweetId: id } });

    res.json({ isLiked: true, likes: likesCount });
  } catch (error) {
    console.error("Like tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// POST /api/tweets/:id/retweet
export async function retweetTweet(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // Vérifier que le tweet original existe
    const original = await prisma.tweet.findUnique({ where: { id } });
    if (!original) {
      res.status(404).json({ error: "Tweet introuvable" });
      return;
    }

    // On ne peut pas retweeter un retweet, on retweete le tweet original
    const targetId = original.retweetOfId || original.id;

    // Vérifier si l'utilisateur a déjà retweeté ce tweet
    const existing = await prisma.tweet.findFirst({
      where: { authorId: userId, retweetOfId: targetId },
    });
    if (existing) {
      res.status(409).json({ error: "Vous avez déjà retweeté ce tweet" });
      return;
    }

    const retweet = await prisma.tweet.create({
      data: {
        content: "",
        authorId: userId,
        retweetOfId: targetId,
      },
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
    const { id } = req.params;
    const userId = req.userId!;

    // Trouver le retweet de l'utilisateur pour ce tweet
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

// DELETE /api/tweets/:id/like
export async function unlikeTweet(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const existing = await prisma.like.findUnique({
      where: { userId_tweetId: { userId, tweetId: id } },
    });

    if (!existing) {
      res.status(404).json({ error: "Like introuvable" });
      return;
    }

    await prisma.like.delete({
      where: { id: existing.id },
    });

    const likesCount = await prisma.like.count({ where: { tweetId: id } });

    res.json({ isLiked: false, likes: likesCount });
  } catch (error) {
    console.error("Unlike tweet error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
