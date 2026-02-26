import { Router } from "express";
import {
  getFeed,
  getTweet,
  createTweet,
  deleteTweet,
  likeTweet,
} from "../controllers/tweet.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const tweetRouter = Router();

// Routes publiques
tweetRouter.get("/", getFeed);
tweetRouter.get("/:id", getTweet);

// Routes protégées (nécessitent un token)
tweetRouter.post("/", authMiddleware, createTweet);
tweetRouter.delete("/:id", authMiddleware, deleteTweet);
tweetRouter.post("/:id/like", authMiddleware, likeTweet);
