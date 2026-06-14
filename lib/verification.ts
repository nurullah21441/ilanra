import { NextResponse } from "next/server";
import type { getCurrentUser } from "@/lib/auth";

export const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

type VerifiedAction = "listing" | "message" | "upload";

const actionMessages: Record<VerifiedAction, string> = {
  listing: "İlan vermek için e-posta adresini doğrulaman gerekiyor.",
  message: "Mesaj göndermek için e-posta adresini doğrulaman gerekiyor.",
  upload: "Fotoğraf yüklemek için e-posta adresini doğrulaman gerekiyor.",
};

export function emailVerificationError(message: string) {
  return NextResponse.json({ error: message, code: EMAIL_NOT_VERIFIED }, { status: 403 });
}

export function requireVerifiedForAction(user: CurrentUser | null, action: VerifiedAction) {
  if (!user) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  if (!user.isVerified) {
    return emailVerificationError(actionMessages[action]);
  }

  return null;
}
