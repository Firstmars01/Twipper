import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /api/users/:username
export async function getUserByUsername(req: Request, res: Response) {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          tweets: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  res.json({ user });
}
