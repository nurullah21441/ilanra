import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_DOMAIN, SITE_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "ilanra gizlilik politikası — kişisel verilerinizin nasıl toplandığı ve korunduğu.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <LegalPageLayout
      title="Gizlilik Politikası"
      subtitle="Kişisel verilerinizin güvenliği bizim için önemlidir. Bu politika, verilerinizi nasıl işlediğimizi açıklar."
      updatedAt="13 Haziran 2025"
    >
      <p>
        Bu Gizlilik Politikası, <strong>{SITE_DOMAIN}</strong> web sitesini ve {SITE_NAME} platformunu
        kullanırken toplanan kişisel verilerin işlenmesine ilişkin esasları belirler. Platformu
        kullanarak bu politikayı kabul etmiş sayılırsınız.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>
        Kişisel verileriniz, {SITE_NAME} platformu tarafından 6698 sayılı Kişisel Verilerin
        Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla işlenmektedir.
        İletişim: <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
      </p>

      <h2>2. Toplanan Veriler</h2>
      <p>Platformumuzda aşağıdaki veri kategorileri toplanabilir:</p>
      <ul>
        <li><strong>Kimlik ve iletişim bilgileri:</strong> ad, soyad, e-posta adresi, telefon numarası</li>
        <li><strong>Hesap bilgileri:</strong> kullanıcı adı, şifre (şifrelenmiş olarak saklanır)</li>
        <li><strong>İlan bilgileri:</strong> ilan başlığı, açıklama, fiyat, konum, fotoğraflar</li>
        <li><strong>İşlem ve kullanım verileri:</strong> favoriler, mesajlar, oturum kayıtları</li>
        <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı türü, cihaz bilgisi, çerez verileri</li>
      </ul>

      <h2>3. Verilerin İşlenme Amaçları</h2>
      <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
      <ul>
        <li>Üyelik hesabınızın oluşturulması ve yönetilmesi</li>
        <li>İlan yayınlama, düzenleme ve görüntüleme hizmetlerinin sunulması</li>
        <li>Alıcı ve satıcı arasında mesajlaşma altyapısının sağlanması</li>
        <li>Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li>Kullanıcı deneyiminin iyileştirilmesi ve teknik destek sunulması</li>
      </ul>

      <h2>4. Verilerin Paylaşılması</h2>
      <p>
        Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.
        Telefon numaranız varsayılan olarak ilanlarda gösterilmez; profil ayarlarından açıkça
        izin vermeniz hâlinde diğer kullanıcılar görebilir. Aksi hâlde iletişim platform
        içi mesajlaşma üzerinden sağlanır.
      </p>
      <p>
        Hizmet altyapımız için güvenilir teknik hizmet sağlayıcıları (sunucu barındırma, e-posta
        servisi vb.) ile yalnızca hizmet sunumu için gerekli ölçüde veri paylaşımı yapılabilir.
      </p>

      <h2>5. Veri Saklama Süresi</h2>
      <p>
        Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama
        yükümlülükleri çerçevesinde muhafaza edilir. Hesabınızı sildiğinizde, yasal zorunluluklar
        hariç verileriniz makul süre içinde silinir veya anonimleştirilir.
      </p>

      <h2>6. Haklarınız</h2>
      <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>Amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
        <li>Silinmesini veya yok edilmesini talep etme</li>
        <li>İşlemenin kısıtlanmasını isteme</li>
      </ul>
      <p>
        Bu haklarınızı kullanmak için <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> adresine
        başvurabilirsiniz.
      </p>

      <h2>7. Güvenlik</h2>
      <p>
        Verilerinizi korumak için SSL şifreleme, güvenli sunucu altyapısı ve erişim kontrolü
        gibi teknik ve idari önlemler uygulanmaktadır. Şifrenizi kimseyle paylaşmamanızı ve
        güçlü bir şifre kullanmanızı öneririz.
      </p>

      <h2>8. Çerezler</h2>
      <p>
        Çerez kullanımına ilişkin ayrıntılı bilgi için{" "}
        <Link href="/cerez-politikasi">Çerez Politikası</Link> sayfamızı inceleyebilirsiniz.
      </p>

      <h2>9. Politika Değişiklikleri</h2>
      <p>
        Bu politika zaman zaman güncellenebilir. Önemli değişiklikler platform üzerinden
        duyurulacaktır. Güncel metin her zaman bu sayfada yayınlanır.
      </p>
    </LegalPageLayout>
  );
}
