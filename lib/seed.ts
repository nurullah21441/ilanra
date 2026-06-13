// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Araçlar", slug: "araclar", icon: "🚗" },
    { name: "Emlak", slug: "emlak", icon: "🏠" },
    { name: "Elektronik", slug: "elektronik", icon: "📱" },
    { name: "Giyim", slug: "giyim", icon: "👗" },
    { name: "Ev & Yaşam", slug: "ev-yasam", icon: "🛋️" },
    { name: "Oyun & Hobi", slug: "oyun-hobi", icon: "🎮" },
    { name: "Bisiklet", slug: "bisiklet", icon: "🚲" },
    { name: "Kitap & Müzik", slug: "kitap-muzik", icon: "📚" },
    { name: "Spor", slug: "spor", icon: "⚽" },
    { name: "Özel Ders", slug: "ozel-ders", icon: "📖" },
    { name: "İş İlanları", slug: "is-ilanlari", icon: "💼" },
    { name: "Tarım & Bahçe", slug: "tarim-bahce", icon: "🌱" },
    { name: "Kozmetik & Bakım", slug: "kozmetik", icon: "💄" },
    { name: "Yiyecek & İçecek", slug: "yiyecek", icon: "🍕" },
    { name: "Hizmetler", slug: "hizmetler", icon: "🔧" },
    { name: "Nakliyat", slug: "nakliyat", icon: "🚚" },
    { name: "Diğer", slug: "diger", icon: "📦" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    });
  }
  console.log("✅ Kategoriler güncellendi");

  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@ilanra.com" },
    update: {},
    create: { name: "Admin", email: "admin@ilanra.com", password: adminPassword, role: "ADMIN" },
  });
  console.log("✅ Admin hesabı: admin@ilanra.com / admin123");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
