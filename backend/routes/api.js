const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { authMiddleware, optionalAuth, adminMiddleware, ilanSahibiMiddleware } = require('../middleware/auth');
const auth = require('../controllers/authController');
const ilan = require('../controllers/ilanController');
const mesaj = require('../controllers/mesajController');
const diger = require('../controllers/diger');

// Multer (dosya yükleme)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Sadece JPEG, PNG ve WebP dosyaları kabul edilir'));
  }
});

// ==================== AUTH ====================
router.post('/auth/kayit', auth.kayitOl);
router.post('/auth/giris', auth.girisYap);
router.get('/auth/profil', authMiddleware, auth.profilGetir);
router.put('/auth/profil', authMiddleware, auth.profilGuncelle);
router.put('/auth/sifre', authMiddleware, auth.sifreDegistir);
router.delete('/auth/hesap', authMiddleware, auth.hesapSil);

// ==================== İLANLAR ====================
router.get('/ilanlar', optionalAuth, ilan.ilanlariGetir);
router.post('/ilanlar', authMiddleware, ilan.ilanOlustur);
router.get('/ilanlar/benim', authMiddleware, ilan.benimilanlar);
router.get('/ilanlar/:id', optionalAuth, ilan.ilanGetir);
router.put('/ilanlar/:id', authMiddleware, ilanSahibiMiddleware, ilan.ilanGuncelle);
router.delete('/ilanlar/:id', authMiddleware, ilanSahibiMiddleware, ilan.ilanSil);
router.post('/ilanlar/:ilan_id/fotograflar', authMiddleware, upload.array('fotograflar', 20), ilan.fotografYukle);
router.get('/ilanlar/:id/fiyat-gecmisi', ilan.fiyatGecmisi);
router.get('/ilanlar/:id/istatistik', authMiddleware, ilan.ilanIstatistik);

// ==================== MESAJLAR ====================
router.get('/mesajlar', authMiddleware, mesaj.konusmalariGetir);
router.post('/mesajlar', authMiddleware, mesaj.mesajGonder);
router.get('/mesajlar/okunmamis', authMiddleware, mesaj.okunmamisSayisi);
router.get('/mesajlar/:konusma_id', authMiddleware, mesaj.mesajlariGetir);

// ==================== FAVORİLER ====================
router.get('/favoriler', authMiddleware, diger.favoriGetir);
router.post('/favoriler/:ilan_id', authMiddleware, diger.favoriEkle);
router.delete('/favoriler/:ilan_id', authMiddleware, diger.favoriKaldir);
router.get('/favoriler/:ilan_id/kontrol', authMiddleware, diger.favoriKontrol);

// ==================== TEKLİFLER ====================
router.get('/teklifler', authMiddleware, diger.teklifleriGetir);
router.post('/teklifler', authMiddleware, diger.teklifGonder);
router.put('/teklifler/:id/yanit', authMiddleware, diger.teklifYanit);

// ==================== BİLDİRİMLER ====================
router.get('/bildirimler', authMiddleware, diger.bildirimleriGetir);
router.put('/bildirimler/tumunu-oku', authMiddleware, diger.bildirimleriOku);
router.delete('/bildirimler/:id', authMiddleware, diger.bildirimSil);

// ==================== KAYITLI ARAMALAR ====================
router.get('/kayitli-aramalar', authMiddleware, diger.kayitliAramalariGetir);
router.post('/kayitli-aramalar', authMiddleware, diger.aramaKaydet);
router.delete('/kayitli-aramalar/:id', authMiddleware, diger.aramaSil);

// ==================== DEĞERLENDİRMELER ====================
router.post('/degerlendirmeler', authMiddleware, diger.degerlendirmeEkle);
router.get('/degerlendirmeler/kullanici/:kullanici_id', diger.degerlendirmeleriGetir);

// ==================== GENEL ====================
router.get('/kategoriler', async (req, res) => {
  const db = require('../config/db');
  try {
    const result = await db.query('SELECT * FROM kategoriler WHERE aktif = true ORDER BY sira, id');
    res.json({ kategoriler: result.rows });
  } catch (err) {
    res.status(500).json({ hata: 'Kategoriler alınamadı' });
  }
});

router.get('/sehirler', async (req, res) => {
  const db = require('../config/db');
  try {
    const result = await db.query('SELECT * FROM sehirler ORDER BY ad');
    res.json({ sehirler: result.rows });
  } catch (err) {
    res.status(500).json({ hata: 'Şehirler alınamadı' });
  }
});

router.get('/sehirler/:sehir_id/ilceler', async (req, res) => {
  const db = require('../config/db');
  try {
    const result = await db.query('SELECT * FROM ilceler WHERE sehir_id = $1 ORDER BY ad', [req.params.sehir_id]);
    res.json({ ilceler: result.rows });
  } catch (err) {
    res.status(500).json({ hata: 'İlçeler alınamadı' });
  }
});

// Satıcı profili
router.get('/kullanicilar/:id', async (req, res) => {
  const db = require('../config/db');
  try {
    const result = await db.query(
      `SELECT u.id, u.ad, u.soyad, u.avatar_url, u.rol, u.onaylandi, u.olusturuldu,
              COUNT(DISTINCT i.id) as ilan_sayisi,
              COALESCE(AVG(d.puan), 0) as ortalama_puan,
              COUNT(DISTINCT d.id) as degerlendirme_sayisi
       FROM users u
       LEFT JOIN ilanlar i ON i.kullanici_id = u.id AND i.durum = 'aktif'
       LEFT JOIN degerlendirmeler d ON d.degerlendirilen_id = u.id
       WHERE u.id = $1 AND u.aktif = true
       GROUP BY u.id`,
      [req.params.id]
    );

    if (!result.rows[0]) return res.status(404).json({ hata: 'Kullanıcı bulunamadı' });
    res.json({ kullanici: result.rows[0] });
  } catch (err) {
    res.status(500).json({ hata: 'Kullanıcı alınamadı' });
  }
});

// Sağlık kontrolü
router.get('/health', (req, res) => {
  res.json({ durum: 'OK', zaman: new Date().toISOString(), versiyon: '1.0.0' });
});

module.exports = router;

// ==================== KATEGORİ ÖZELLİKLERİ ====================
const kategori = require('../controllers/kategoriController');

router.get('/markalar/arac', kategori.markalariGetir);
router.get('/ilanlar/:ilan_id/ozellikler/:kategori', kategori.ozellikGetir);
router.post('/ilanlar/:ilan_id/ozellikler/otomobil', authMiddleware, kategori.otomobilKaydet);
router.post('/ilanlar/:ilan_id/ozellikler/konut', authMiddleware, kategori.konutKaydet);
router.post('/ilanlar/:ilan_id/ozellikler/telefon', authMiddleware, kategori.cepTelefonuKaydet);
router.post('/ilanlar/:ilan_id/etiketler', authMiddleware, kategori.etiketKaydet);

// ==================== ADMIN PANELİ ====================
const admin = require('../controllers/adminController');

router.get('/admin/dashboard', authMiddleware, adminMiddleware, admin.dashboard);
router.get('/admin/kullanicilar', authMiddleware, adminMiddleware, admin.kullanicilariGetir);
router.put('/admin/kullanicilar/:id/ban', authMiddleware, adminMiddleware, admin.kullaniciBanla);
router.put('/admin/kullanicilar/:id/rol', authMiddleware, adminMiddleware, admin.kullaniciRolDegistir);
router.get('/admin/ilanlar', authMiddleware, adminMiddleware, admin.adminIlanlariGetir);
router.put('/admin/ilanlar/:id/durum', authMiddleware, adminMiddleware, admin.adminIlanDurumDegistir);
router.get('/admin/sikayetler', authMiddleware, adminMiddleware, admin.sikayetleriGetir);
router.get('/admin/ayarlar', authMiddleware, adminMiddleware, admin.ayarlariGetir);
router.get('/admin/istatistik', authMiddleware, adminMiddleware, admin.detayliIstatistik);
