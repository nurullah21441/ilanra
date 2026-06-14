import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { getCurrentUser } from "@/lib/auth";
import { loginPath } from "@/lib/auth-url";
import { publicPhone } from "@/lib/user-contact";
import { parseAttributesJson } from "@/lib/listing-attributes";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const seller = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!seller) return { title: "Satıcı bulunamadı" };
  return {
    title: `${seller.name} - Satıcı Profili`,
    description: `${seller.name} satıcısının aktif ilanlarını görüntüle ve iletişime geç.`,
  };
}

export default async function SaticiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatar: true,
      phone: true,
      showPhoneOnListings: true,
      createdAt: true,
      isVerified: true,
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!seller) notFound();

  const listings = await prisma.listing.findMany({
    where: { userId: id, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
      user: { select: { isVerified: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 48,
  });

  const currentUser = await getCurrentUser();
  const isSelf = currentUser?.id === seller.id;
  const phone = publicPhone(seller);
  const memberSince = new Date(seller.createdAt).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

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
          <span style={{ color: "#333" }}>{seller.name}</span>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "0.5px solid #E8E8E5",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1.25rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--brand-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 26,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {seller.name[0]}
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                  color: "#111",
                }}
              >
                {seller.name}
              </h1>
              {seller.isVerified && (
                <div style={{ marginTop: 6 }}>
                  <VerifiedBadge size="md" />
                </div>
              )}
              <p style={{ fontSize: 13.5, color: "#888", margin: "4px 0 0" }}>
                {memberSince} tarihinden beri üye · {seller._count.listings} aktif ilan
              </p>
            </div>
          </div>

          {!isSelf && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link
                href={currentUser ? `/mesajlar?receiverId=${seller.id}` : loginPath(`/mesajlar?receiverId=${seller.id}`)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 18px",
                  background: "var(--brand)",
                  color: "#fff",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Mesaj gönder
              </Link>
              {phone && (
                <a
                  href={`tel:${phone}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 18px",
                    background: "#fff",
                    color: "#333",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                    border: "0.5px solid #E8E8E5",
                  }}
                >
                  Telefon ile ara
                </a>
              )}
            </div>
          )}
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
            Bu satıcının aktif ilanı bulunmuyor.
          </div>
        ) : (
          <div className="listing-grid">
            {serialized.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
