import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "ilanra hakkında — misyonumuz, vizyonumuz ve değerlerimiz.",
};

export default function HakkimizdaPage() {
  return (
    <LegalPageLayout
      title="Hakkımızda"
      subtitle="Türkiye'de alıcı ile satıcıyı güvenli, hızlı ve komisyonsuz bir şekilde buluşturuyoruz."
    >
      <h2>Biz Kimiz?</h2>
      <p>
        <strong>{SITE_NAME}</strong>, Türkiye genelinde bireylerin ve işletmelerin ürün ve hizmetlerini
        kolayca paylaşabildiği modern bir ilan platformudur. Araçtan emlağa, elektronikten hizmet
        sektörüne kadar geniş bir yelpazede ilan yayınlamanızı; alıcıların ise gerçek fiyatlarla
        doğrudan satıcıya ulaşmasını sağlıyoruz.
      </p>
      <p>
        Komisyon almadan, şeffaf ve kullanıcı odaklı bir deneyim sunmayı hedefliyoruz. Platformumuz
        sürekli geliştirilmekte; güvenlik, performans ve kullanım kolaylığı önceliklerimiz arasındadır.
      </p>

      <h2>Misyonumuz</h2>
      <p>
        Herkesin güvenle ilan verebildiği, aradığını hızlıca bulabildiği ve gereksiz aracılara
        ihtiyaç duymadan doğrudan iletişim kurabildiği bir pazar yeri oluşturmak.
      </p>

      <h2>Vizyonumuz</h2>
      <p>
        Türkiye&apos;nin en güvenilir ve en kullanıcı dostu ilan platformu olmak; teknoloji ile
        günlük alışveriş ve ticaret deneyimini sadeleştirmek.
      </p>

      <h2>Değerlerimiz</h2>
      <ul>
        <li><strong>Şeffaflık</strong> — Gizli ücret veya sürpriz komisyon yok.</li>
        <li><strong>Güven</strong> — Kullanıcı verilerinin korunması ve güvenli iletişim önceliğimizdir.</li>
        <li><strong>Erişilebilirlik</strong> — Herkesin kolayca kullanabileceği sade bir arayüz.</li>
        <li><strong>Yerellik</strong> — Türkiye&apos;nin şehir ve ilçe yapısına uygun, yerel odaklı hizmet.</li>
      </ul>

      <h2>İletişim</h2>
      <p>
        Sorularınız, önerileriniz veya iş birliği talepleriniz için bize{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> adresinden ulaşabilirsiniz.
        Ayrıntılı iletişim bilgileri için{" "}
        <Link href="/iletisim">İletişim</Link> sayfamızı ziyaret edebilirsiniz.
      </p>
    </LegalPageLayout>
  );
}
