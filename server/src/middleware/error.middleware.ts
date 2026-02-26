import { Request, Response, NextFunction } from "express";

// Middleware de gestion d'erreur centralisé
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("❌ Error:", err.message);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
  });
}
