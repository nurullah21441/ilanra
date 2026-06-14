import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import {
  appBaseUrl,
  createResetToken,
  hashResetToken,
} from "@/lib/password-reset";

export function verificationExpiresAt() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export async function issueAndSendVerificationEmail(userId: string, email: string) {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = createResetToken();
  const tokenHash = await hashResetToken(token);

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: verificationExpiresAt(),
    },
  });

  const verifyUrl = `${appBaseUrl()}/eposta-dogrula?token=${encodeURIComponent(token)}`;
  const mail = await sendVerificationEmail(email, verifyUrl);
  return { ...mail, verifyUrl };
}
