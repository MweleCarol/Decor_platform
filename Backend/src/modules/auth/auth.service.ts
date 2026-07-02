import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import {
  ConflictError,
  UnauthorizedError,
} from "../../shared/errors/app-error.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

const SALT_ROUNDS = 12;

interface AccessTokenPayload {
  sub: string;
  role: "CUSTOMER" | "ADMIN";
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

async function issueRefreshToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(rawToken),
      userId,
      expiresAt,
    },
  });

  return rawToken;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
    },
  });

  return { id: user.id, email: user.email, fullName: user.fullName };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const accessToken = generateAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await issueRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  };
}

export async function refresh(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const accessToken = generateAccessToken({
    sub: stored.user.id,
    role: stored.user.role,
  });
  const newRefreshToken = await issueRefreshToken(stored.user.id);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}