import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

export async function registerHandler(req: Request, res: Response) {
  const input = res.locals.validated.body as RegisterInput;
  const user = await authService.register(input);
  res.status(201).json({ user });
}

export async function loginHandler(req: Request, res: Response) {
  const input = res.locals.validated.body as LoginInput;
  const result = await authService.login(input);
  res.status(200).json(result);
}

export async function refreshHandler(req: Request, res: Response) {
  const { refreshToken } = res.locals.validated.body as { refreshToken: string };
  const result = await authService.refresh(refreshToken);
  res.status(200).json(result);
}

export async function logoutHandler(req: Request, res: Response) {
  const { refreshToken } = res.locals.validated.body as { refreshToken: string };
  await authService.logout(refreshToken);
  res.status(204).send();
}