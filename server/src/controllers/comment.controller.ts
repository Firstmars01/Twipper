import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { findTweetById } from "../helpers/tweet.helper";
import { parsePagination } from "../helpers/pagination.helper";
import { commentInclude, formatComment, validateCommentContent, findCommentById } from "../helpers/comment.helper";

// GET /api/tweets/:tweetId/comments
export async function getComments(req: AuthRequest, res: Response) {
  try {
    const { tweetId } = req.params;
    const userId = req.userId!;
    const { skip, take } = parsePagination(req);

    const tweet = await findTweetById(tweetId);
    if (!tweet) {
      res.status(404).json({ error: "Tweet introuvable" });
      return;
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { tweetId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: commentInclude(userId),
      }),
      prisma.comment.count({ where: { tweetId } }),
    ]);

    res.json({ data: comments.map(formatComment), total });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// POST /api/tweets/:tweetId/comments
export async function createComment(req: AuthRequest, res: Response) {
  try {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    const validationError = validateCommentContent(content);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const tweet = await findTweetById(tweetId);
    if (!tweet) {
      res.status(404).json({ error: "Tweet introuvable" });
      return;
    }

    const comment = await prisma.comment.create({
      data: { content: content.trim(), authorId: userId, tweetId },
      include: commentInclude(userId),
    });

    if (tweet.authorId !== userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, avatar: true },
      });
      if (currentUser) {
        await prisma.notification.create({
          data: {
            type: "comment",
            userId: tweet.authorId,
            fromUsername: currentUser.username,
            fromAvatar: currentUser.avatar,
            tweetContent: content.trim().substring(0, 80),
          },
        });
      }
    }

    res.status(201).json(formatComment(comment));
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// PUT /api/comments/:commentId
export async function updateComment(req: AuthRequest, res: Response) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    const validationError = validateCommentContent(content);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const comment = await findCommentById(commentId);
    if (!comment) {
      res.status(404).json({ error: "Commentaire introuvable" });
      return;
    }
    if (comment.authorId !== userId) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: commentInclude(userId),
    });

    res.json(formatComment(updated));
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// DELETE /api/comments/:commentId
export async function deleteComment(req: AuthRequest, res: Response) {
  try {
    const { commentId } = req.params;
    const userId = req.userId!;

    const comment = await findCommentById(commentId);
    if (!comment) {
      res.status(404).json({ error: "Commentaire introuvable" });
      return;
    }
    if (comment.authorId !== userId) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: "Commentaire supprimé" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
