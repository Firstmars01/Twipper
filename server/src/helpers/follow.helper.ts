import prisma from "../lib/prisma";

/** Construit la clé composite Prisma pour un Follow */
export function followCompositeKey(followerId: string, followingId: string) {
  return { followerId_followingId: { followerId, followingId } } as const;
}

/** Vérifie si un follow existe déjà */
export function findExistingFollow(followerId: string, followingId: string) {
  return prisma.follow.findUnique({ where: followCompositeKey(followerId, followingId) });
}

/** Crée un follow */
export function createFollow(followerId: string, followingId: string) {
  return prisma.follow.create({ data: { followerId, followingId } });
}

/** Supprime un follow */
export function deleteFollow(followerId: string, followingId: string) {
  return prisma.follow.delete({ where: followCompositeKey(followerId, followingId) });
}
