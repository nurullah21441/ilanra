import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import IlanGallery from "@/components/IlanGallery";
import { getCurrentUser } from "@/lib/auth";
import { loginPath } from "@/lib/auth-url";

export default async function IlanDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      user: { select: { id: true, name: true, phone: true, avatar: true, createdAt: true } },
    },
  });

  if (!listing) notFound();
  await prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } });

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === listing.user.id;

  const conditionMap: Record<string, string> = {
    NEW: "Sıfır", LIKE_NEW: "Sıfır Gibi", USED: "İkinci El", DEFECTIVE: "Hasarlı",
  };
  const formatted = new Intl.NumberFormat("tr-TR").format(listing.price);

  const messagePath = `/mesajlar?listingId=${listing.id}&receiverId=${listing.user.id}`;

  return (
    <>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 1100 }}>

        {/* Breadcrumb */}
        <div className="detail-breadcrumb" style={{ fontSize: 13, color: "#999", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ color: "#999", textDecoration: "none" }}>Ana Sayfa</Link>
          <span>/</span>
          <Link href={`/ilanlar?category=${listing.category.slug}`} style={{ color: "#999", textDecoration: "none" }}>{listing.category.name}</Link>
          <span>/</span>
          <span style={{ color: "#333" }}>{listing.title.slice(0, 40)}{listing.title.length > 40 ? "..." : ""}</span>
        </div>

        <div className="detail-grid">

          {/* SOL */}
          <div>
            {/* GALERİ */}
            <IlanGallery
              images={listing.images.map((img: {url: string}) => img.url)}
              title={listing.title}
              isFeatured={listing.isFeatured}
            />

            {/* AÇIKLAMA */}
            <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #E8E8E5", padding: "1.5rem", marginTop: "1.25rem" }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: "1rem" }}>İlan Açıklaması</h2>
              <p style={{ fontSize: 14.5, color: "#444", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{listing.description}</p>

              <div className="detail-meta" style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "0.5px solid #f0f0ee" }}>
                {([
                  ["Kategori", listing.category.name],
                  ["Durum", conditionMap[listing.condition]],
                  ["Şehir", listing.city + (listing.district ? ` / ${listing.district}` : "")],
                  ["Görüntülenme", `${listing.views} kez`],
                  ["İlan Tarihi", new Date(listing.createdAt).toLocaleDateString("tr-TR")],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <span style={{ fontSize: 11.5, color: "#aaa", display: "block", marginBottom: 2 }}>{label}</span>
                    <span style={{ fontSize: 14, color: "#111", fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SAĞ */}
          <div className="detail-sidebar">
            <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #E8E8E5", padding: "1.5rem", marginBottom: "1rem" }}>
              <div className="detail-price" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: "#111", marginBottom: 6, letterSpacing: -1 }}>₺{formatted}</div>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: "#333", marginBottom: "1.5rem", lineHeight: 1.45 }}>{listing.title}</h1>

              {listing.isFeatured && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12, color: "var(--brand)", fontWeight: 600, marginBottom: "1rem" }}>
                  ⭐ Öne Çıkan İlan
                </div>
              )}

              <a href={`tel:${listing.user.phone}`} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px", background: "var(--brand)", color: "#fff",
                borderRadius: 11, fontWeight: 700, fontSize: 15, textDecoration: "none",
                marginBottom: 8, transition: "background .15s",
              }} className="btn-red">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                Telefon ile ara
              </a>
              {!isOwner && (
                <Link
                  href={currentUser ? messagePath : loginPath(messagePath)}
                  style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px", background: "#fff", color: "#333",
                  borderRadius: 11, fontWeight: 500, fontSize: 15, textDecoration: "none",
                  border: "0.5px solid #E8E8E5",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Mesaj gönder
                </Link>
              )}
            </div>

            {/* SATICI */}
            <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
              <p style={{ fontSize: 11.5, color: "#aaa", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: .4, fontWeight: 600 }}>Satıcı</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 800, flexShrink: 0 }}>
                  {listing.user.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{listing.user.name}</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                    {new Date(listing.user.createdAt).toLocaleDateString("tr-TR")} tarihinden beri üye
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
