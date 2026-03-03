import { Router } from "express";
import { createTweet, updateTweet, deleteTweet } from "../controllers/tweet.controller";
import { getFeed, getGlobalFeed, getUserTweets } from "../controllers/feed.controller";
import { likeTweet, unlikeTweet } from "../controllers/like.controller";
import { retweetTweet, unretweetTweet } from "../controllers/retweet.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const tweetRouter = Router();

tweetRouter.use(authMiddleware);

tweetRouter.post("/", createTweet);
tweetRouter.get("/feed", getFeed);
tweetRouter.get("/global", getGlobalFeed);
tweetRouter.get("/user/:username", getUserTweets);
tweetRouter.put("/:id", updateTweet);
tweetRouter.delete("/:id", deleteTweet);
tweetRouter.post("/:id/like", likeTweet);
tweetRouter.delete("/:id/like", unlikeTweet);
tweetRouter.post("/:id/retweet", retweetTweet);
tweetRouter.delete("/:id/retweet", unretweetTweet);
