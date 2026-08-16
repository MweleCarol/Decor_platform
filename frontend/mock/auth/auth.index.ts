import { MOCK_ACCOUNTS } from "./accounts.data";
import type { User } from "@/stores/auth.store";

export { MOCK_ACCOUNTS } from "./accounts.data";

const MOCK_DELAY_MS = 400;
function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function fakeTokens(userId: string) {
  const stamp = Date.now();
  return {
    accessToken: `mock-access-${userId}-${stamp}`,
    refreshToken: `mock-refresh-${userId}-${stamp}`,
  };
}

/**
 * Mirrors POST /api/auth/login — matches against preset accounts,
 * rejects with a realistic error so the login page's error UI still
 * gets exercised properly (not just the happy path).
 */
export async function mockLogin(email: string, password: string) {
  const match = MOCK_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
  );
  if (!match) {
    await delay(null, 300);
    throw new Error("Invalid email or password");
  }
  return delay({ user: match.user, ...fakeTokens(match.user.id) });
}

/**
 * Mirrors POST /api/auth/register — always succeeds (new accounts don't
 * need to match a preset), builds a fresh CUSTOMER user from form input.
 * Note: this new user is NOT added to MOCK_ACCOUNTS, so it won't be
 * log-in-able again after logout/reload — only the two presets persist
 * across sessions. Fine for now since register just needs to demonstrate
 * the auto-login flow, not full account persistence.
 */
export async function mockRegister(input: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const user: User = {
    id: `mock-user-${Date.now()}`,
    email: input.email,
    fullName: input.fullName,
    role: "CUSTOMER",
  };
  return delay({ user, ...fakeTokens(user.id) });
}