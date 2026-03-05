import { Router } from "express";
import { getComments, createComment, updateComment, deleteComment } from "../controllers/comment.controller";
import { likeComment, unlikeComment } from "../controllers/comment-like.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const commentRouter = Router();

commentRouter.use(authMiddleware);

// Commentaires d'un tweet
commentRouter.get("/tweets/:tweetId/comments", getComments);
commentRouter.post("/tweets/:tweetId/comments", createComment);

// Opérations sur un commentaire
commentRouter.put("/comments/:commentId", updateComment);
commentRouter.delete("/comments/:commentId", deleteComment);

// Like / Unlike un commentaire
commentRouter.post("/comments/:commentId/like", likeComment);
commentRouter.delete("/comments/:commentId/like", unlikeComment);
