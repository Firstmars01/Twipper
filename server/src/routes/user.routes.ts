import { Router } from "express";
import {
  getProfile,
  getUserTweets,
  toggleFollow,
  updateProfile,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const userRouter = Router();

// Route protégée — modifier son profil
userRouter.put("/me", authMiddleware, updateProfile);

// Routes publiques
userRouter.get("/:username", getProfile);
userRouter.get("/:username/tweets", getUserTweets);

// Route protégée — follow/unfollow
userRouter.post("/:username/follow", authMiddleware, toggleFollow);
