import prisma from "../lib/prisma";

/** Sélection publique minimale d'un utilisateur (profil card) */
export const USER_PUBLIC_SELECT = {
  id: true,
  username: true,
  bio: true,
  avatar: true,
} as const;

/**
 * Résout un username en User ou `null`.
 * Par défaut ne retourne que les champs publics ; passer `select` pour personnaliser.
 */
export async function findUserByUsername<
  S extends Record<string, unknown> = typeof USER_PUBLIC_SELECT,
>(username: string, select?: S) {
  return prisma.user.findUnique({
    where: { username },
    select: (select ?? USER_PUBLIC_SELECT) as any,
  });
}
