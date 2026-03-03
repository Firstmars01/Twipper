import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";
import { tweetRouter } from "./routes/tweet.routes";

import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares globaux ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/tweets", tweetRouter);


// --- Error handler (doit être le dernier middleware) ---
app.use(errorHandler);

// --- Start ---
app.listen(PORT, () => {
  console.log(`Twipper API running on http://localhost:${PORT}`);
});

export default app;
