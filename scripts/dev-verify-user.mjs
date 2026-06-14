import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = process.argv[2] || "n@gmail.com";
const action = process.argv[3] || "link";
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function hashToken(token) {
  return bcrypt.hash(token, 10);
}

const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true, name: true, email: true, isVerified: true },
});

if (!user) {
  console.error("Kullanıcı bulunamadı:", email);
  process.exit(1);
}

console.log("Kullanıcı:", user);

if (action === "verify") {
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  console.log("✅ E-posta doğrulandı (manuel).");
} else {
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  const token = createToken();
  const tokenHash = await hashToken(token);
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  const verifyUrl = `${baseUrl}/eposta-dogrula?token=${encodeURIComponent(token)}`;
  console.log("\n🔗 Doğrulama linki:\n", verifyUrl);
}

await prisma.$disconnect();
