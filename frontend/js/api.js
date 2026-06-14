// İlanra Frontend API İstemcisi
// Tüm HTML sayfalara bu dosyayı ekle: <script src="js/api.js"></script>

const API_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';;

// ===== TOKEN YÖNETİMİ =====
const ilanra = {
  token: () => localStorage.getItem('ilanra_token'),
  kullanici: () => JSON.parse(localStorage.getItem('ilanra_kullanici') || 'null'),
  girisYapildi: () => !!localStorage.getItem('ilanra_token'),

  tokenKaydet: (token, kullanici) => {
    localStorage.setItem('ilanra_token', token);
    localStorage.setItem('ilanra_kullanici', JSON.stringify(kullanici));
  },

  cikisYap: () => {
    localStorage.removeItem('ilanra_token');
    localStorage.removeItem('ilanra_kullanici');
    window.location.href = 'giris.html';
  },

  // ===== API İSTEK YARDIMCISI =====
  istek: async (method, endpoint, veri = null, dosyaVar = false) => {
    const headers = {};
    const token = ilanra.token();

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!dosyaVar) headers['Content-Type'] = 'application/json';

    const ayarlar = { method, headers };

    if (veri) {
      ayarlar.body = dosyaVar ? veri : JSON.stringify(veri);
    }

    try {
      const yanit = await fetch(`${API_URL}${endpoint}`, ayarlar);
      const data = await yanit.json();

      if (yanit.status === 401) {
        ilanra.cikisYap();
        return null;
      }

      if (!yanit.ok) {
        throw new Error(data.hata || 'Bir hata oluştu');
      }

      return data;
    } catch (err) {
      console.error('API hatası:', err);
      throw err;
    }
  },

  // ===== AUTH =====
  kayitOl: (veri) => ilanra.istek('POST', '/auth/kayit', veri),
  girisYap: (veri) => ilanra.istek('POST', '/auth/giris', veri),
  profilGetir: () => ilanra.istek('GET', '/auth/profil'),
  profilGuncelle: (veri) => ilanra.istek('PUT', '/auth/profil', veri),
  sifreDegistir: (veri) => ilanra.istek('PUT', '/auth/sifre', veri),

  // ===== İLANLAR =====
  ilanlariGetir: (filtreler = {}) => {
    const params = new URLSearchParams(filtreler).toString();
    return ilanra.istek('GET', `/ilanlar?${params}`);
  },
  ilanGetir: (id) => ilanra.istek('GET', `/ilanlar/${id}`),
  ilanOlustur: (veri) => ilanra.istek('POST', '/ilanlar', veri),
  ilanGuncelle: (id, veri) => ilanra.istek('PUT', `/ilanlar/${id}`, veri),
  ilanSil: (id) => ilanra.istek('DELETE', `/ilanlar/${id}`),
  benimilanlar: (filtreler = {}) => {
    const params = new URLSearchParams(filtreler).toString();
    return ilanra.istek('GET', `/ilanlar/benim?${params}`);
  },
  fotografYukle: (ilan_id, dosyalar) => {
    const formData = new FormData();
    for (const dosya of dosyalar) formData.append('fotograflar', dosya);
    return ilanra.istek('POST', `/ilanlar/${ilan_id}/fotograflar`, formData, true);
  },
  fiyatGecmisi: (id) => ilanra.istek('GET', `/ilanlar/${id}/fiyat-gecmisi`),
  ilanIstatistik: (id) => ilanra.istek('GET', `/ilanlar/${id}/istatistik`),

  // ===== MESAJLAR =====
  konusmalariGetir: () => ilanra.istek('GET', '/mesajlar'),
  mesajlariGetir: (konusma_id) => ilanra.istek('GET', `/mesajlar/${konusma_id}`),
  mesajGonder: (veri) => ilanra.istek('POST', '/mesajlar', veri),
  okunmamisSayisi: () => ilanra.istek('GET', '/mesajlar/okunmamis'),

  // ===== FAVORİLER =====
  favoriGetir: () => ilanra.istek('GET', '/favoriler'),
  favoriEkle: (ilan_id) => ilanra.istek('POST', `/favoriler/${ilan_id}`),
  favoriKaldir: (ilan_id) => ilanra.istek('DELETE', `/favoriler/${ilan_id}`),
  favoriKontrol: (ilan_id) => ilanra.istek('GET', `/favoriler/${ilan_id}/kontrol`),

  // ===== TEKLİFLER =====
  teklifGonder: (veri) => ilanra.istek('POST', '/teklifler', veri),
  teklifleriGetir: (tur = 'gelen') => ilanra.istek('GET', `/teklifler?tur=${tur}`),
  teklifYanit: (id, veri) => ilanra.istek('PUT', `/teklifler/${id}/yanit`, veri),

  // ===== BİLDİRİMLER =====
  bildirimleriGetir: () => ilanra.istek('GET', '/bildirimler'),
  bildirimleriOku: () => ilanra.istek('PUT', '/bildirimler/tumunu-oku'),
  bildirimSil: (id) => ilanra.istek('DELETE', `/bildirimler/${id}`),

  // ===== KAYITLI ARAMALAR =====
  kayitliAramalariGetir: () => ilanra.istek('GET', '/kayitli-aramalar'),
  aramaKaydet: (veri) => ilanra.istek('POST', '/kayitli-aramalar', veri),
  aramaSil: (id) => ilanra.istek('DELETE', `/kayitli-aramalar/${id}`),

  // ===== DEĞERLENDİRMELER =====
  degerlendirmeEkle: (veri) => ilanra.istek('POST', '/degerlendirmeler', veri),
  degerlendirmeleriGetir: (kullanici_id) => ilanra.istek('GET', `/degerlendirmeler/kullanici/${kullanici_id}`),

  // ===== GENEL =====
  kategorileriGetir: () => ilanra.istek('GET', '/kategoriler'),
  sehirleriGetir: () => ilanra.istek('GET', '/sehirler'),
  ilceleriGetir: (sehir_id) => ilanra.istek('GET', `/sehirler/${sehir_id}/ilceler`),
  kullaniciGetir: (id) => ilanra.istek('GET', `/kullanicilar/${id}`),

  // ===== YARDIMCI FONKSİYONLAR =====
  fiyatFormat: (fiyat, para = 'TRY') => {
    if (!fiyat) return '—';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: para,
      minimumFractionDigits: 0
    }).format(fiyat);
  },

  tarihFormat: (tarih) => {
    if (!tarih) return '—';
    const d = new Date(tarih);
    const simdi = new Date();
    const fark = Math.floor((simdi - d) / 1000);

    if (fark < 60) return 'Az önce';
    if (fark < 3600) return `${Math.floor(fark / 60)} dakika önce`;
    if (fark < 86400) return `${Math.floor(fark / 3600)} saat önce`;
    if (fark < 172800) return 'Dün';

    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  bildirimGoster: (mesaj, tip = 'basari') => {
    const renk = { basari: '#0a0', hata: '#c00', bilgi: '#0066cc', uyari: '#f0a000' };
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: ${renk[tip]}; color: #fff; padding: 12px 20px;
      border-radius: 6px; font-size: 14px; font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 350px;
      animation: slideIn 0.3s ease;
    `;
    div.textContent = mesaj;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
  },

  // Giriş gerektiren sayfalar için kontrol
  girisKontrol: () => {
    if (!ilanra.girisYapildi()) {
      window.location.href = 'giris.html';
      return false;
    }
    return true;
  },

  // Navbar'ı güncelle
  navbarGuncelle: () => {
    const kullanici = ilanra.kullanici();
    const girisLink = document.querySelector('.giris-link');
    const profilLink = document.querySelector('.profil-link');
    const ilanVerBtn = document.querySelector('.ilan-ver-btn');

    if (kullanici) {
      if (girisLink) girisLink.style.display = 'none';
      if (profilLink) {
        profilLink.style.display = 'block';
        profilLink.textContent = kullanici.ad;
      }
      // Okunmamış sayısını güncelle
      ilanra.okunmamisSayisi().then(data => {
        if (data && data.okunmamis > 0) {
          const badge = document.querySelector('.mesaj-badge');
          if (badge) badge.textContent = data.okunmamis;
        }
      }).catch(() => {});
    }
  }
};

// Socket.io bağlantısı (mesajlaşma için)
let socket = null;

const socketBaglan = () => {
  if (typeof io === 'undefined') return;

  socket = io(SOCKET_URL);
  const kullanici = ilanra.kullanici();

  if (kullanici) {
    socket.emit('kullanici_baglandi', kullanici.id);
  }

  socket.on('yeni_mesaj', (data) => {
    // Mesaj sayfasındaysa güncelle
    if (window.mesajGuncelleCallback) {
      window.mesajGuncelleCallback(data);
    }
    // Bildirim sesi/badge
    const badge = document.querySelector('.mesaj-badge');
    if (badge && document.hidden) {
      badge.textContent = parseInt(badge.textContent || '0') + 1;
    }
  });

  socket.on('kullanici_yaziyor', (data) => {
    if (window.yaziyorCallback) window.yaziyorCallback(data);
  });

  return socket;
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  ilanra.navbarGuncelle();
});

// Global erişim
window.ilanra = ilanra;
window.socketBaglan = socketBaglan;
