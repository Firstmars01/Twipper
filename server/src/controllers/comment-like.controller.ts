import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { findCommentById } from "../helpers/comment.helper";

// POST /api/comments/:commentId/like
export async function likeComment(req: AuthRequest, res: Response) {
  try {
    const { commentId } = req.params;
    const userId = req.userId!;

    const comment = await findCommentById(commentId);
    if (!comment) {
      res.status(404).json({ error: "Commentaire introuvable" });
      return;
    }

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (existing) {
      res.status(409).json({ error: "Déjà liké" });
      return;
    }

    await prisma.commentLike.create({ data: { userId, commentId } });
    const likesCount = await prisma.commentLike.count({ where: { commentId } });

    res.json({ isLiked: true, likesCount });
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// DELETE /api/comments/:commentId/like
export async function unlikeComment(req: AuthRequest, res: Response) {
  try {
    const { commentId } = req.params;
    const userId = req.userId!;

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (!existing) {
      res.status(404).json({ error: "Like introuvable" });
      return;
    }

    await prisma.commentLike.delete({ where: { id: existing.id } });
    const likesCount = await prisma.commentLike.count({ where: { commentId } });

    res.json({ isLiked: false, likesCount });
  } catch (error) {
    console.error("Unlike comment error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
