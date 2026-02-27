import { Router } from "express";
import { register, login, getMe, refreshToken } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refreshToken);
authRouter.get("/me", authMiddleware, getMe);
