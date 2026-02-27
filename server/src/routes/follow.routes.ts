import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/follow.controller";

export const followRouter = Router();

// Routes publiques (lecture)
followRouter.get("/:username/followers", getFollowers);
followRouter.get("/:username/following", getFollowing);

// Routes protégées (actions)
followRouter.post("/:username/follow", authMiddleware, followUser);
followRouter.delete("/:username/follow", authMiddleware, unfollowUser);
