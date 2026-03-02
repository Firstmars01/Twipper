import { Router } from "express";
import { createTweet, getFeed, getUserTweets, updateTweet, deleteTweet } from "../controllers/tweet.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const tweetRouter = Router();

tweetRouter.use(authMiddleware);

tweetRouter.post("/", createTweet);
tweetRouter.get("/feed", getFeed);
tweetRouter.get("/user/:username", getUserTweets);
tweetRouter.put("/:id", updateTweet);
tweetRouter.delete("/:id", deleteTweet);
