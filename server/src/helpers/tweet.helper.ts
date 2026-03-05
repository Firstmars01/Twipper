import prisma from "../lib/prisma";

const MAX_TWEET_LENGTH = 280;

/**
 * Include commun pour les requêtes tweet (author, likes count, isLiked, retweetOf).
 */
export function tweetInclude(userId: string) {
  return {
    author: {
      select: { id: true, username: true, avatar: true },
    },
    _count: { select: { likes: true, comments: true } },
    likes: {
      where: { userId },
      select: { id: true },
    },
    retweetOf: {
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { likes: true, comments: true } },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
    },
  };
}

/**
 * Transforme le résultat Prisma : ajoute `isLiked`, retire le tableau `likes` brut.
 */
export function formatTweet(tweet: any) {
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

/**
 * Valide le contenu d'un tweet. Retourne un message d'erreur ou `null` si OK.
 */
export function validateTweetContent(content: unknown): string | null {
  if (!content || !(content as string).trim()) {
    return "Le contenu du tweet est requis";
  }
  if ((content as string).length > MAX_TWEET_LENGTH) {
    return `Le tweet ne peut pas dépasser ${MAX_TWEET_LENGTH} caractères`;
  }
  return null;
}

/**
 * Cherche un tweet par id. Retourne le tweet ou `null`.
 */
export function findTweetById(id: string) {
  return prisma.tweet.findUnique({ where: { id } });
}
