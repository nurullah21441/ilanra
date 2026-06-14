import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PARENT_CATEGORIES, SUBCATEGORIES } from "./category-data.mjs";

const prisma = new PrismaClient();

for (const cat of PARENT_CATEGORIES) {
  const parent = await prisma.category.upsert({
    where: { slug: cat.slug },
    update: { name: cat.name, icon: cat.icon, parentId: null },
    create: { name: cat.name, slug: cat.slug, icon: cat.icon },
  });

  const children = SUBCATEGORIES[cat.slug];
  if (!children) continue;

  for (const child of children) {
    await prisma.category.upsert({
      where: { slug: child.slug },
      update: { name: child.name, icon: cat.icon, parentId: parent.id },
      create: {
        name: child.name,
        slug: child.slug,
        icon: cat.icon,
        parentId: parent.id,
      },
    });
  }
}
console.log("✅ Kategoriler ve alt kategoriler güncellendi");

const adminPassword = await bcrypt.hash("admin123", 12);
await prisma.user.upsert({
  where: { email: "admin@ilanra.com" },
  update: { role: "ADMIN", name: "Admin" },
  create: { name: "Admin", email: "admin@ilanra.com", password: adminPassword, role: "ADMIN" },
});
console.log("✅ Admin hesabı: admin@ilanra.com / admin123");

await prisma.$disconnect();
