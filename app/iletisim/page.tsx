import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: "ilanra ile iletişime geçin — destek, öneri ve iş birliği talepleri.",
};

export default function IletisimPage() {
  return (
    <LegalPageLayout
      title="İletişim"
      subtitle="Sorularınız, önerileriniz veya destek talepleriniz için bize ulaşın. En kısa sürede yanıt vermeye çalışıyoruz."
    >
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: "2rem",
      }}>
        {[
          {
            icon: "✉️",
            title: "E-posta",
            desc: "Genel sorular ve destek",
            value: SITE_EMAIL,
            href: `mailto:${SITE_EMAIL}`,
          },
          {
            icon: "⏱️",
            title: "Yanıt Süresi",
            desc: "Ortalama geri dönüş",
            value: "1–2 iş günü",
            href: null,
          },
          {
            icon: "🇹🇷",
            title: "Hizmet Bölgesi",
            desc: "Türkiye geneli",
            value: "7/24 online platform",
            href: null,
          },
        ].map(card => (
          <div key={card.title} style={{
            padding: "1.25rem",
            borderRadius: 14,
            background: "#fafaf8",
            border: "0.5px solid #ececea",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 12, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 12.5, color: "#aaa", marginBottom: 8 }}>{card.desc}</div>
            {card.href ? (
              <a href={card.href} style={{ fontSize: 14.5, fontWeight: 600, color: "#E63946", textDecoration: "none" }}>
                {card.value}
              </a>
            ) : (
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#333" }}>{card.value}</div>
            )}
          </div>
        ))}
      </div>

      <h2>Bize Yazın</h2>
      <p>
        Aşağıdaki konularda <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> adresine
        e-posta gönderebilirsiniz:
      </p>
      <ul>
        <li>Hesap ve üyelik sorunları</li>
        <li>İlan yayınlama, düzenleme veya kaldırma talepleri</li>
        <li>Şikayet ve kötüye kullanım bildirimleri</li>
        <li>Gizlilik ve kişisel veri talepleri (KVKK)</li>
        <li>İş birliği ve reklam teklifleri</li>
        <li>Genel öneri ve geri bildirimler</li>
      </ul>

      <h2>E-posta Gönderirken</h2>
      <p>
        Talebinizin hızlı çözülmesi için e-postanızda mümkünse şu bilgileri paylaşın:
      </p>
      <ul>
        <li>{SITE_NAME} hesabınıza kayıtlı e-posta adresi</li>
        <li>İlgili ilan numarası veya bağlantısı (varsa)</li>
        <li>Sorunun kısa ve net açıklaması</li>
        <li>Varsa ekran görüntüsü</li>
      </ul>

      <h2>Sık Sorulan Konular</h2>
      <p>
        Birçok sorunun cevabı platform içinde mevcuttur. İlan vermek için{" "}
        <Link href="/ilan-ver">İlan Ver</Link>, hesap oluşturmak için{" "}
        <Link href="/kayit">Kayıt Ol</Link> sayfalarını ziyaret edebilirsiniz.
      </p>
      <p>
        Gizlilik ve veri işleme hakkında bilgi için{" "}
        <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>, platform kuralları için{" "}
        <Link href="/kullanim-sartlari">Kullanım Şartları</Link> sayfalarına göz atın.
      </p>

      <div style={{
        marginTop: "2rem",
        padding: "1.25rem 1.5rem",
        borderRadius: 14,
        background: "linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)",
        border: "0.5px solid #fecaca",
      }}>
        <p style={{ margin: 0, fontSize: 14.5, color: "#555", lineHeight: 1.65 }}>
          <strong style={{ color: "#E63946" }}>Not:</strong> {SITE_NAME}, kullanıcılar arasındaki
          alım-satım işlemlerine taraf değildir. Ürün teslimatı, ödeme veya anlaşmazlıklar doğrudan
          alıcı ile satıcı arasında çözülmelidir. Dolandırıcılık şüphesi durumunda derhal bize
          bildirin ve yasal mercilere başvurun.
        </p>
      </div>
    </LegalPageLayout>
  );
}
