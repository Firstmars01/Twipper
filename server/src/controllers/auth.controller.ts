import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt";

/** Sélection commune pour les réponses user */
const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  username: true,
  bio: true,
  avatar: true,
  createdAt: true,
} as const;

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ error: "Tous les champs sont requis" });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      res.status(409).json({ error: "Email ou username déjà utilisé" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    const tokens = generateTokenPair(user.id);

    res.status(201).json({ user, ...tokens });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password))) {
      res.status(401).json({ error: "Identifiants invalides" });
      return;
    }

    const tokens = generateTokenPair(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// GET /api/auth/me
export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...USER_PUBLIC_SELECT,
        _count: { select: { tweets: true, followers: true, following: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}

// POST /api/auth/refresh
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token requis" });
      return;
    }

    let decoded: { userId: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({ error: "Refresh token invalide ou expiré" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, username: true, bio: true, avatar: true },
    });

    if (!user) {
      res.status(401).json({ error: "Utilisateur introuvable" });
      return;
    }

    const tokens = generateTokenPair(user.id);

    res.json({ user, ...tokens });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
}
