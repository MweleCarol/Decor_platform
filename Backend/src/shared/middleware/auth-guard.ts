import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../modules/auth/auth.service.js";
import { UnauthorizedError, ForbiddenError } from "../errors/app-error.js";

declare global {
  namespace Express {
    interface Locals {
      auth?: { userId: string; role: "CUSTOMER" | "ADMIN" };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing access token"));
  }

  const token = header.slice("Bearer ".length);
  const payload = verifyAccessToken(token);

  res.locals.auth = { userId: payload.sub, role: payload.role };
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (res.locals.auth?.role !== "ADMIN") {
    return next(new ForbiddenError("Admin access required"));
  }
  next();
}