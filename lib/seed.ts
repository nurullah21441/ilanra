// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const { seedCategories } = await import("./category-seed");
  await seedCategories();
  console.log("✅ Kategoriler ve alt kategoriler güncellendi");

  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@ilanra.com" },
    update: { role: "ADMIN", name: "Admin" },
    create: { name: "Admin", email: "admin@ilanra.com", password: adminPassword, role: "ADMIN" },
  });
  console.log("✅ Admin hesabı: admin@ilanra.com / admin123");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
