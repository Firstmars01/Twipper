import type { AuthRequest } from "../middleware/auth.middleware";

/**
 * Extrait page & limit depuis les query params (défauts : page=1, limit=20).
 * Retourne `{ skip, take }` prêt pour Prisma.
 */
export function parsePagination(req: AuthRequest) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
  return { skip: (page - 1) * limit, take: limit };
}
