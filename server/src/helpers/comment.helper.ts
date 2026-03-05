import prisma from "../lib/prisma";

const MAX_COMMENT_LENGTH = 280;

/** Include commun pour les requêtes commentaire */
export function commentInclude(userId: string) {
  return {
    author: {
      select: { id: true, username: true, avatar: true },
    },
    _count: { select: { likes: true } },
    likes: {
      where: { userId },
      select: { id: true },
    },
  };
}

/** Formate un commentaire Prisma → ajoute isLiked, likesCount */
export function formatComment(comment: any) {
  const { likes, _count, ...rest } = comment;
  return {
    ...rest,
    isLiked: likes.length > 0,
    likesCount: _count.likes,
  };
}

/** Valide le contenu d'un commentaire. Retourne un message d'erreur ou null. */
export function validateCommentContent(content: unknown): string | null {
  if (!content || !(content as string).trim()) {
    return "Le contenu du commentaire est requis";
  }
  if ((content as string).length > MAX_COMMENT_LENGTH) {
    return `Le commentaire ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères`;
  }
  return null;
}

/** Cherche un commentaire par id. Retourne le commentaire ou null. */
export function findCommentById(id: string) {
  return prisma.comment.findUnique({ where: { id } });
}
