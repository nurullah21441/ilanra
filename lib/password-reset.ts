import crypto from "crypto";
import bcrypt from "bcryptjs";

export function createResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashResetToken(token: string) {
  return bcrypt.hash(token, 10);
}

export async function verifyResetToken(token: string, hash: string) {
  return bcrypt.compare(token, hash);
}

export function resetExpiresAt() {
  return new Date(Date.now() + 60 * 60 * 1000);
}

export function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
