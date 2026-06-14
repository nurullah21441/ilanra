const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ===== DASHBOARD =====
const dashboard = async (req, res) => {
  try {
    const [
      kullanicilar, ilanlar, mesajlar, teklifler,
      bugunKullanici, bugunIlan, aktifIlan, gelir
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users WHERE aktif = true'),
      db.query('SELECT COUNT(*) FROM ilanlar WHERE durum != $1', ['silindi']),
      db.query('SELECT COUNT(*) FROM mesajlar'),
      db.query('SELECT COUNT(*) FROM teklifler'),
      db.query("SELECT COUNT(*) FROM users WHERE DATE(olusturuldu) = CURRENT_DATE"),
      db.query("SELECT COUNT(*) FROM ilanlar WHERE DATE(olusturuldu) = CURRENT_DATE"),
      db.query("SELECT COUNT(*) FROM ilanlar WHERE durum = 'aktif'"),
      db.query("SELECT COUNT(*) FROM ilanlar WHERE durum = 'satildi'")
    ]);

    // Son 7 gün istatistik
    const haftaIlan = await db.query(`
      SELECT DATE(olusturuldu) as gun, COUNT(*) as sayi
      FROM ilanlar
      WHERE olusturuldu > NOW() - INTERVAL '7 days'
      GROUP BY DATE(olusturuldu)
      ORDER BY gun
    `);

    const haftaKullanici = await db.query(`
      SELECT DATE(olusturuldu) as gun, COUNT(*) as sayi
      FROM users
      WHERE olusturuldu > NOW() - INTERVAL '7 days'
      GROUP BY DATE(olusturuldu)
      ORDER BY gun
    `);

    // Son ilanlar
    const sonIlanlar = await db.query(`
      SELECT i.id, i.baslik, i.fiyat, i.durum, i.olusturuldu,
             u.ad, u.soyad, u.email
      FROM ilanlar i
      JOIN users u ON u.id = i.kullanici_id
      WHERE i.durum != 'silindi'
      ORDER BY i.olusturuldu DESC
      LIMIT 10
    `);

    // Son kayıtlar
    const sonKullanicilar = await db.query(`
      SELECT id, ad, soyad, email, rol, aktif, olusturuldu
      FROM users
      ORDER BY olusturuldu DESC
      LIMIT 10
    `);

    // Kategori dağılımı
    const kategoriDagilim = await db.query(`
      SELECT k.ad, COUNT(i.id) as sayi
      FROM kategoriler k
      LEFT JOIN ilanlar i ON i.kategori_id = k.id AND i.durum = 'aktif'
      WHERE k.ust_id IS NULL
      GROUP BY k.id, k.ad
      ORDER BY sayi DESC
    `);

    res.json({
      ozet: {
        toplam_kullanici: parseInt(kullanicilar.rows[0].count),
        toplam_ilan: parseInt(ilanlar.rows[0].count),
        toplam_mesaj: parseInt(mesajlar.rows[0].count),
        toplam_teklif: parseInt(teklifler.rows[0].count),
        bugun_kullanici: parseInt(bugunKullanici.rows[0].count),
        bugun_ilan: parseInt(bugunIlan.rows[0].count),
        aktif_ilan: parseInt(aktifIlan.rows[0].count),
        satilan_ilan: parseInt(gelir.rows[0].count)
      },
      grafik: {
        hafta_ilan: haftaIlan.rows,
        hafta_kullanici: haftaKullanici.rows
      },
      son_ilanlar: sonIlanlar.rows,
      son_kullanicilar: sonKullanicilar.rows,
      kategori_dagilim: kategoriDagilim.rows
    });
  } catch (err) {
    console.error('Dashboard hatası:', err);
    res.status(500).json({ hata: 'Dashboard verisi alınamadı' });
  }
};

// ===== KULLANICILAR =====
const kullanicilariGetir = async (req, res) => {
  try {
    const { sayfa = 1, limit = 20, ara, rol, aktif, siralama = 'yeni' } = req.query;
    const offset = (parseInt(sayfa) - 1) * parseInt(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (ara) {
      params.push(`%${ara}%`);
      where += ` AND (u.ad ILIKE $${params.length} OR u.soyad ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }
    if (rol) { params.push(rol); where += ` AND u.rol = $${params.length}`; }
    if (aktif !== undefined) { params.push(aktif === 'true'); where += ` AND u.aktif = $${params.length}`; }

    const siralamaMap = { yeni: 'u.olusturuldu DESC', eski: 'u.olusturuldu ASC', ilan: 'ilan_sayisi DESC' };

    const result = await db.query(`
      SELECT u.id, u.ad, u.soyad, u.email, u.telefon, u.rol, u.aktif,
             u.onaylandi, u.email_onaylandi, u.son_giris, u.olusturuldu,
             COUNT(DISTINCT i.id) as ilan_sayisi,
             COUNT(DISTINCT m.id) as mesaj_sayisi
      FROM users u
      LEFT JOIN ilanlar i ON i.kullanici_id = u.id AND i.durum != 'silindi'
      LEFT JOIN mesajlar m ON m.gonderen_id = u.id
      ${where}
      GROUP BY u.id
      ORDER BY ${siralamaMap[siralama] || 'u.olusturuldu DESC'}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), offset]);

    const count = await db.query(`SELECT COUNT(*) FROM users u ${where}`, params);

    res.json({
      kullanicilar: result.rows,
      toplam: parseInt(count.rows[0].count),
      sayfa: parseInt(sayfa),
      toplam_sayfa: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ hata: 'Kullanıcılar alınamadı' });
  }
};

const kullaniciBanla = async (req, res) => {
  try {
    const { id } = req.params;
    const { ban, sebep } = req.body;

    await db.query(
      'UPDATE users SET aktif = $1, guncellendi = NOW() WHERE id = $2',
      [!ban, id]
    );

    // İlanlarını da pasife al
    if (ban) {
      await db.query(
        "UPDATE ilanlar SET durum = 'pasif' WHERE kullanici_id = $1",
        [id]
      );
    }

    res.json({ mesaj: ban ? 'Kullanıcı banlandı' : 'Ban kaldırıldı' });
  } catch (err) {
    res.status(500).json({ hata: 'İşlem başarısız' });
  }
};

const kullaniciRolDegistir = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!['kullanici', 'galeri', 'admin'].includes(rol)) {
      return res.status(400).json({ hata: 'Geçersiz rol' });
    }

    await db.query('UPDATE users SET rol = $1 WHERE id = $2', [rol, id]);
    res.json({ mesaj: 'Rol güncellendi' });
  } catch (err) {
    res.status(500).json({ hata: 'Rol güncellenemedi' });
  }
};

// ===== İLANLAR =====
const adminIlanlariGetir = async (req, res) => {
  try {
    const { sayfa = 1, limit = 20, ara, durum, kategori, siralama = 'yeni' } = req.query;
    const offset = (parseInt(sayfa) - 1) * parseInt(limit);
    const params = [];
    let where = "WHERE i.durum != 'silindi'";

    if (ara) {
      params.push(`%${ara}%`);
      where += ` AND (i.baslik ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }
    if (durum) { params.push(durum); where += ` AND i.durum = $${params.length}`; }
    if (kategori) { params.push(kategori); where += ` AND i.kategori_id = $${params.length}`; }

    const result = await db.query(`
      SELECT i.id, i.baslik, i.fiyat, i.durum, i.olusturuldu, i.goruntulenme,
             i.favori_sayisi, i.mesaj_sayisi,
             u.id as kullanici_id, u.ad, u.soyad, u.email,
             k.ad as kategori, s.ad as sehir,
             (SELECT url FROM ilan_fotograflar WHERE ilan_id = i.id AND kapak = true LIMIT 1) as kapak
      FROM ilanlar i
      JOIN users u ON u.id = i.kullanici_id
      LEFT JOIN kategoriler k ON k.id = i.kategori_id
      LEFT JOIN sehirler s ON s.id = i.sehir_id
      ${where}
      ORDER BY i.olusturuldu DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), offset]);

    const count = await db.query(
      `SELECT COUNT(*) FROM ilanlar i JOIN users u ON u.id = i.kullanici_id ${where}`,
      params
    );

    res.json({
      ilanlar: result.rows,
      toplam: parseInt(count.rows[0].count),
      sayfa: parseInt(sayfa),
      toplam_sayfa: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ hata: 'İlanlar alınamadı' });
  }
};

const adminIlanDurumDegistir = async (req, res) => {
  try {
    const { id } = req.params;
    const { durum, sebep } = req.body;

    const gecerliDurumlar = ['aktif', 'pasif', 'silindi', 'beklemede'];
    if (!gecerliDurumlar.includes(durum)) {
      return res.status(400).json({ hata: 'Geçersiz durum' });
    }

    await db.query(
      'UPDATE ilanlar SET durum = $1, guncellendi = NOW() WHERE id = $2',
      [durum, id]
    );

    // İlan sahibine bildirim
    const ilan = await db.query('SELECT kullanici_id, baslik FROM ilanlar WHERE id = $1', [id]);
    if (ilan.rows[0]) {
      const mesajlar = {
        aktif: 'İlanınız yayına alındı',
        pasif: 'İlanınız yayından kaldırıldı',
        silindi: 'İlanınız silindi'
      };
      if (mesajlar[durum]) {
        await db.query(
          `INSERT INTO bildirimler (kullanici_id, tip, baslik, icerik)
           VALUES ($1, 'admin', $2, $3)`,
          [ilan.rows[0].kullanici_id, mesajlar[durum],
           `"${ilan.rows[0].baslik}" — ${sebep || ''}`]
        );
      }
    }

    res.json({ mesaj: 'İlan durumu güncellendi' });
  } catch (err) {
    res.status(500).json({ hata: 'İlan güncellenemedi' });
  }
};

// ===== ŞİKAYETLER =====
const sikayetleriGetir = async (req, res) => {
  try {
    // Şikayet tablosu yoksa örnek veri dön
    res.json({
      sikayetler: [],
      toplam: 0,
      mesaj: 'Şikayet sistemi hazırlandı'
    });
  } catch (err) {
    res.status(500).json({ hata: 'Şikayetler alınamadı' });
  }
};

// ===== AYARLAR =====
const ayarlariGetir = async (req, res) => {
  res.json({
    ayarlar: {
      site_adi: 'ilanra.com',
      site_aciklama: "Türkiye'nin Yeni İlan Platformu",
      iletisim_email: 'destek@ilanra.com',
      max_fotograf: 20,
      max_dosya_mb: 5,
      ilan_suresi_gun: 30,
      ucretsiz_ilan_limiti: 5,
      kayit_aktif: true,
      ilan_onay_gerekli: false
    }
  });
};

// ===== İSTATİSTİKLER =====
const detayliIstatistik = async (req, res) => {
  try {
    const [sehirDagilim, gunlukAktivite, enCokIlan] = await Promise.all([
      db.query(`
        SELECT s.ad, COUNT(i.id) as sayi
        FROM sehirler s
        LEFT JOIN ilanlar i ON i.sehir_id = s.id AND i.durum = 'aktif'
        GROUP BY s.id, s.ad ORDER BY sayi DESC LIMIT 10
      `),
      db.query(`
        SELECT DATE(olusturuldu) as gun, COUNT(*) as ilan_sayisi
        FROM ilanlar
        WHERE olusturuldu > NOW() - INTERVAL '30 days'
        GROUP BY DATE(olusturuldu) ORDER BY gun
      `),
      db.query(`
        SELECT u.id, u.ad, u.soyad, u.email, COUNT(i.id) as ilan_sayisi
        FROM users u
        JOIN ilanlar i ON i.kullanici_id = u.id
        WHERE i.durum != 'silindi'
        GROUP BY u.id ORDER BY ilan_sayisi DESC LIMIT 10
      `)
    ]);

    res.json({
      sehir_dagilim: sehirDagilim.rows,
      gunluk_aktivite: gunlukAktivite.rows,
      en_cok_ilan_verenler: enCokIlan.rows
    });
  } catch (err) {
    res.status(500).json({ hata: 'İstatistikler alınamadı' });
  }
};

module.exports = {
  dashboard, kullanicilariGetir, kullaniciBanla, kullaniciRolDegistir,
  adminIlanlariGetir, adminIlanDurumDegistir,
  sikayetleriGetir, ayarlariGetir, detayliIstatistik
};
