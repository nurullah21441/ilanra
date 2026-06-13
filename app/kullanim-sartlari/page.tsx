import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_DOMAIN, SITE_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "ilanra kullanım şartları — platform kuralları ve kullanıcı yükümlülükleri.",
};

export default function KullanimSartlariPage() {
  return (
    <LegalPageLayout
      title="Kullanım Şartları"
      subtitle="ilanra platformunu kullanırken uymanız gereken kurallar ve koşullar."
      updatedAt="13 Haziran 2025"
    >
      <p>
        Bu Kullanım Şartları, <strong>{SITE_DOMAIN}</strong> adresindeki {SITE_NAME} platformunun
        kullanımına ilişkin kuralları belirler. Platforma üye olarak veya ziyaret ederek bu şartları
        kabul etmiş sayılırsınız.
      </p>

      <h2>1. Hizmet Tanımı</h2>
      <p>
        {SITE_NAME}, kullanıcıların ilan yayınlamasına ve diğer kullanıcıların bu ilanları
        görüntülemesine, aramasına ve iletişim kurmasına olanak tanıyan bir aracı platformdur.
        {SITE_NAME}, ilanlarda sunulan ürün veya hizmetlerin tarafı değildir; alım-satım işlemleri
        doğrudan kullanıcılar arasında gerçekleşir.
      </p>

      <h2>2. Üyelik ve Hesap Güvenliği</h2>
      <ul>
        <li>18 yaşından büyük olmanız veya yasal temsilci onayıyla işlem yapmanız gerekir.</li>
        <li>Kayıt sırasında doğru ve güncel bilgiler vermeniz zorunludur.</li>
        <li>Hesap bilgilerinizin gizliliğinden ve hesabınız üzerinden yapılan tüm işlemlerden siz sorumlusunuz.</li>
        <li>Bir kişi yalnızca bir hesap açabilir; sahte veya çoklu hesaplar kapatılabilir.</li>
      </ul>

      <h2>3. İlan Kuralları</h2>
      <p>Yayınladığınız ilanlar aşağıdaki kurallara uygun olmalıdır:</p>
      <ul>
        <li>İlan içeriği gerçek, doğru ve güncel olmalıdır.</li>
        <li>Yasadışı ürün veya hizmetler (uyuşturucu, silah, sahte belge vb.) ilan edilemez.</li>
        <li>Telif hakkı ihlali, yanıltıcı reklam veya aldatıcı bilgi içeremez.</li>
        <li>Nefret söylemi, ayrımcılık veya müstehcen içerik yasaktır.</li>
        <li>Başkasına ait fotoğraf veya içerik izinsiz kullanılamaz.</li>
        <li>Aynı ürün için mükerrer (spam) ilan açılamaz.</li>
      </ul>
      <p>
        Kurallara aykırı ilanlar önceden bildirim yapılmaksızın kaldırılabilir; tekrarlayan ihlallerde
        hesap askıya alınabilir veya kalıcı olarak kapatılabilir.
      </p>

      <h2>4. Kullanıcı Sorumlulukları</h2>
      <ul>
        <li>Diğer kullanıcılarla saygılı ve dürüst iletişim kurmak</li>
        <li>Platformu kötüye kullanmamak (bot, otomatik tarama, sistem saldırısı vb.)</li>
        <li>Üçüncü kişilerin haklarına saygı göstermek</li>
        <li>Yürürlükteki mevzuata uygun hareket etmek</li>
      </ul>

      <h2>5. Ücretlendirme</h2>
      <p>
        {SITE_NAME} temel ilan yayınlama hizmetini ücretsiz sunar. İleride ücretli özellikler
        (öne çıkarma, premium paketler vb.) eklenebilir; bu durumda kullanıcılar önceden
        bilgilendirilir.
      </p>

      <h2>6. Sorumluluk Sınırlaması</h2>
      <p>
        {SITE_NAME}, kullanıcılar arasındaki alım-satım, ödeme, teslimat veya anlaşmazlıklardan
        sorumlu değildir. Platform &quot;olduğu gibi&quot; sunulur; kesintisiz veya hatasız çalışma
        garantisi verilmez. Mücbir sebep hallerinde hizmet geçici olarak durdurulabilir.
      </p>

      <h2>7. Fikri Mülkiyet</h2>
      <p>
        {SITE_NAME} adı, logosu, arayüz tasarımı ve yazılım altyapısı {SITE_NAME}&apos;a aittir.
        İzinsiz kopyalama, çoğaltma veya ticari kullanım yasaktır. İlanlara yüklediğiniz
        içeriklerin telif hakkı size aittir; platforma bu içerikleri yayınlama için sınırlı
        bir lisans vermiş olursunuz.
      </p>

      <h2>8. Hesabın Sonlandırılması</h2>
      <p>
        Hesabınızı istediğiniz zaman kapatabilirsiniz. {SITE_NAME}, kullanım şartlarını ihlal
        eden hesapları askıya alma veya kalıcı olarak kapatma hakkını saklı tutar.
      </p>

      <h2>9. Uygulanacak Hukuk</h2>
      <p>
        Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Türkiye mahkemeleri
        ve icra daireleri yetkilidir.
      </p>

      <h2>10. İletişim</h2>
      <p>
        Kullanım şartları hakkında sorularınız için{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> adresine yazabilir veya{" "}
        <Link href="/iletisim">İletişim</Link> sayfamızı kullanabilirsiniz.
      </p>
    </LegalPageLayout>
  );
}
