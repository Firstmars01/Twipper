import { Router } from "express";
import { getUserByUsername } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/follow.controller";

export const userRouter = Router();

userRouter.get("/:username", getUserByUsername);
userRouter.get("/:username/followers", getFollowers);
userRouter.get("/:username/following", getFollowing);
userRouter.post("/:username/follow", authMiddleware, followUser);
userRouter.delete("/:username/follow", authMiddleware, unfollowUser);
