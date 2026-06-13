import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_DOMAIN, SITE_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "ilanra çerez politikası — hangi çerezleri kullandığımız ve nasıl yönetebileceğiniz.",
};

export default function CerezPolitikasiPage() {
  return (
    <LegalPageLayout
      title="Çerez Politikası"
      subtitle="Web sitemizde kullanılan çerezler ve tercihlerinizi nasıl yönetebileceğiniz hakkında bilgi."
      updatedAt="13 Haziran 2025"
    >
      <p>
        Bu Çerez Politikası, <strong>{SITE_DOMAIN}</strong> web sitesinde ({SITE_NAME}) hangi
        çerezlerin kullanıldığını, bunların ne amaçla işlendiğini ve tercihlerinizi nasıl
        yönetebileceğinizi açıklar.
      </p>

      <h2>1. Çerez Nedir?</h2>
      <p>
        Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin
        dosyalarıdır. Oturumunuzu hatırlamak, tercihlerinizi saklamak ve site performansını
        ölçmek gibi işlevler için kullanılırlar.
      </p>

      <h2>2. Kullandığımız Çerez Türleri</h2>

      <h2 style={{ fontSize: 16, marginTop: "1.25rem" }}>Zorunlu Çerezler</h2>
      <p>
        Platformun temel işlevleri için gereklidir; devre dışı bırakılamazlar.
      </p>
      <ul>
        <li><strong>Oturum çerezi:</strong> Giriş yaptığınızda hesabınızı tanımak için</li>
        <li><strong>Güvenlik çerezi:</strong> Oturum güvenliği ve CSRF koruması için</li>
      </ul>

      <h2 style={{ fontSize: 16, marginTop: "1.25rem" }}>İşlevsel Çerezler</h2>
      <p>
        Kullanıcı deneyimini iyileştirmek için kullanılır.
      </p>
      <ul>
        <li><strong>Tercih çerezleri:</strong> Dil, görünüm veya filtre tercihlerinizi hatırlamak için</li>
        <li><strong>Favori / son görüntülenen:</strong> Gezinme deneyiminizi kişiselleştirmek için</li>
      </ul>

      <h2 style={{ fontSize: 16, marginTop: "1.25rem" }}>Analitik Çerezler</h2>
      <p>
        Ziyaretçi sayısı, sayfa görüntüleme ve kullanım istatistiklerini anonim olarak toplamak
        için kullanılabilir. Bu veriler platformu geliştirmemize yardımcı olur.
      </p>

      <h2>3. Çerezlerin Saklama Süresi</h2>
      <ul>
        <li><strong>Oturum çerezleri:</strong> Tarayıcı kapatıldığında silinir</li>
        <li><strong>Kalıcı çerezler:</strong> Belirli bir süre (genellikle 30 gün – 1 yıl) cihazınızda kalır</li>
      </ul>

      <h2>4. Üçüncü Taraf Çerezleri</h2>
      <p>
        Platformumuzda harita, analitik veya sosyal medya entegrasyonu gibi üçüncü taraf
        hizmetler kullanıldığında, bu sağlayıcıların kendi çerezleri de devreye girebilir.
        Bu çerezler ilgili üçüncü tarafın gizlilik politikasına tabidir.
      </p>

      <h2>5. Çerez Tercihlerinizi Yönetme</h2>
      <p>
        Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezlerin
        engellenmesi platformun düzgün çalışmamasına neden olabilir (örneğin giriş yapamama).
      </p>
      <p>Yaygın tarayıcılarda çerez ayarlarına şu yollardan ulaşabilirsiniz:</p>
      <ul>
        <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
        <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
        <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
        <li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
      </ul>

      <h2>6. Kişisel Veriler ve KVKK</h2>
      <p>
        Çerezler aracılığıyla işlenen kişisel verilere ilişkin ayrıntılı bilgi için{" "}
        <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link> sayfamızı inceleyebilirsiniz.
        Haklarınızı kullanmak için <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> adresine
        başvurabilirsiniz.
      </p>

      <h2>7. Politika Güncellemeleri</h2>
      <p>
        Bu politika zaman zaman güncellenebilir. Güncel metin her zaman bu sayfada yayınlanır.
        Önemli değişiklikler platform üzerinden duyurulacaktır.
      </p>
    </LegalPageLayout>
  );
}
