import { prisma } from "@/lib/prisma";
import { PARENT_CATEGORIES, SUBCATEGORIES } from "@/lib/category-seed-data";

export async function seedCategories() {
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
}

/** Kategori slug'ına göre filtre için categoryId listesi (parent + children) */
export async function categoryIdsForSlug(slug: string): Promise<string[] | null> {
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: { children: { select: { id: true } } },
  });
  if (!cat) return null;
  return [cat.id, ...cat.children.map((c) => c.id)];
}
