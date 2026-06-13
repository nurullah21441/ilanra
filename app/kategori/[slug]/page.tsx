import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import { parseAttributesJson } from "@/lib/listing-attributes";
import { categoryIdsForSlug } from "@/lib/category-seed";

export default async function KategoriPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { name: "asc" } },
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!category) notFound();

  const categoryIds = await categoryIdsForSlug(slug);
  const listingWhere = {
    status: "ACTIVE" as const,
    categoryId: categoryIds ? { in: categoryIds } : category.id,
  };

  const listings = await prisma.listing.findMany({
    where: listingWhere,
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  const totalActive = await prisma.listing.count({ where: listingWhere });

  const serialized = listings.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    attributes: parseAttributesJson(l.attributes),
  }));

  return (
    <>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 1100 }}>
        <div style={{ fontSize: 13, color: "#999", marginBottom: "1.25rem" }}>
          <Link href="/" style={{ color: "#999", textDecoration: "none" }}>Ana Sayfa</Link>
          <span> / </span>
          <span style={{ color: "#333" }}>{category.name}</span>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "0.5px solid #E8E8E5",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: category.children.length ? "1rem" : 0 }}>
            <span style={{ fontSize: 36 }}>{category.icon}</span>
            <div>
              <h1
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  margin: 0,
                  color: "#111",
                }}
              >
                {category.name}
              </h1>
              <p style={{ fontSize: 13.5, color: "#888", margin: "4px 0 0" }}>
                {totalActive} aktif ilan
              </p>
            </div>
          </div>

          {category.children.length > 0 && (
            <div className="subcat-chips" style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: "1rem", borderTop: "0.5px solid #f0f0ee" }}>
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/kategori/${child.slug}`}
                  className="subcat-chip"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 100,
                    background: "#f5f5f3",
                    color: "#444",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    maxWidth: "100%",
                  }}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <Link
              href={`/ilanlar?category=${category.slug}`}
              style={{
                fontSize: 13.5,
                color: "var(--brand)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Filtreli arama ve sıralama →
            </Link>
          </div>
        </div>

        {serialized.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: "#999",
              background: "#fff",
              borderRadius: 14,
              border: "0.5px solid #E8E8E5",
            }}
          >
            Bu kategoride henüz ilan yok.
            <div style={{ marginTop: "1rem" }}>
              <Link
                href="/ilan-ver"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "var(--brand)",
                  color: "#fff",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                İlan ver
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="listing-grid">
              {serialized.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            {totalActive > serialized.length && (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <Link
                  href={`/ilanlar?category=${category.slug}`}
                  style={{
                    display: "inline-block",
                    padding: "12px 28px",
                    background: "#fff",
                    border: "0.5px solid #E8E8E5",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#333",
                    textDecoration: "none",
                  }}
                >
                  Tüm {totalActive} ilanı gör
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
