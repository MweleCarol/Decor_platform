import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { env } from "../../config/env.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    error: "Internal server error",
    ...(env.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
}