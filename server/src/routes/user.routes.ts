import { Router } from "express";
import { getUserByUsername } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.get("/:username", getUserByUsername);
