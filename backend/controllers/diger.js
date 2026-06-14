const db = require('../config/db');

// ===== FAVORİLER =====

const favoriEkle = async (req, res) => {
  try {
    const { ilan_id } = req.params;

    await db.query(
      'INSERT INTO favoriler (kullanici_id, ilan_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.kullanici.id, ilan_id]
    );

    await db.query('UPDATE ilanlar SET favori_sayisi = favori_sayisi + 1 WHERE id = $1', [ilan_id]);

    res.json({ mesaj: 'Favorilere eklendi' });
  } catch (err) {
    res.status(500).json({ hata: 'Favoriye eklenemedi' });
  }
};

const favoriKaldir = async (req, res) => {
  try {
    const { ilan_id } = req.params;

    const result = await db.query(
      'DELETE FROM favoriler WHERE kullanici_id = $1 AND ilan_id = $2',
      [req.kullanici.id, ilan_id]
    );

    if (result.rowCount > 0) {
      await db.query('UPDATE ilanlar SET favori_sayisi = GREATEST(0, favori_sayisi - 1) WHERE id = $1', [ilan_id]);
    }

    res.json({ mesaj: 'Favoriden kaldırıldı' });
  } catch (err) {
    res.status(500).json({ hata: 'Favoriden kaldırılamadı' });
  }
};

const favoriGetir = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.id, i.baslik, i.fiyat, i.durum, i.olusturuldu,
              s.ad as sehir, f.olusturuldu as favoriye_eklenme,
              (SELECT url FROM ilan_fotograflar WHERE ilan_id = i.id AND kapak = true LIMIT 1) as kapak_foto
       FROM favoriler f
       JOIN ilanlar i ON i.id = f.ilan_id
       LEFT JOIN sehirler s ON s.id = i.sehir_id
       WHERE f.kullanici_id = $1 AND i.durum != 'silindi'
       ORDER BY f.olusturuldu DESC`,
      [req.kullanici.id]
    );

    res.json({ favoriler: result.rows });
  } catch (err) {
    res.status(500).json({ hata: 'Favoriler alınamadı' });
  }
};

const favoriKontrol = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id FROM favoriler WHERE kullanici_id = $1 AND ilan_id = $2',
      [req.kullanici.id, req.params.ilan_id]
    );
    res.json({ favoride: !!result.rows[0] });
  } catch (err) {
    res.status(500).json({ hata: 'Kontrol edilemedi' });
  }
};

// ===== TEKLİFLER =====

const teklifGonder = async (req, res) => {
  try {
    const { ilan_id, teklif_fiyati, not, gecerlilik_saat = 48 } = req.body;

    const ilan = await db.query('SELECT kullanici_id, fiyat FROM ilanlar WHERE id = $1', [ilan_id]);
    if (!ilan.rows[0]) return res.status(404).json({ hata: 'İlan bulunamadı' });

    if (ilan.rows[0].kullanici_id === req.kullanici.id) {
      return res.status(400).json({ hata: 'Kendi ilanınıza teklif veremezsiniz' });
    }

    // Bekleyen teklif var mı?
    const bekleyen = await db.query(
      "SELECT id FROM teklifler WHERE ilan_id = $1 AND alici_id = $2 AND durum = 'bekliyor'",
      [ilan_id, req.kullanici.id]
    );

    if (bekleyen.rows[0]) {
      return res.status(400).json({ hata: 'Bu ilan için zaten bekleyen bir teklifiniz var' });
    }

    const gecerlilik = new Date();
    gecerlilik.setHours(gecerlilik.getHours() + parseInt(gecerlilik_saat));

    const result = await db.query(
      `INSERT INTO teklifler (ilan_id, alici_id, satici_id, teklif_fiyati, not, gecerlilik_suresi)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [ilan_id, req.kullanici.id, ilan.rows[0].kullanici_id, teklif_fiyati, not || null, gecerlilik]
    );

    // Satıcıya bildirim
    await db.query(
      `INSERT INTO bildirimler (kullanici_id, tip, baslik, icerik, link)
       VALUES ($1, 'teklif', 'Yeni teklif aldınız', $2, $3)`,
      [ilan.rows[0].kullanici_id,
       `${req.kullanici.ad} ${req.kullanici.soyad} size ${teklif_fiyati} TL teklif verdi`,
       `/teklifler/${result.rows[0].id}`]
    );

    res.status(201).json({ mesaj: 'Teklifiniz gönderildi', teklif: result.rows[0] });
  } catch (err) {
    console.error('Teklif hatası:', err);
    res.status(500).json({ hata: 'Teklif gönderilemedi' });
  }
};

const teklifleriGetir = async (req, res) => {
  try {
    const { tur = 'gelen' } = req.query;

    const kondisyon = tur === 'gelen'
      ? 'satici_id = $1'
      : 'alici_id = $1';

    const result = await db.query(
      `SELECT t.*, i.baslik as ilan_baslik, i.fiyat as ilan_fiyati,
              alici.ad as alici_ad, alici.soyad as alici_soyad,
              satici.ad as satici_ad, satici.soyad as satici_soyad,
              (SELECT url FROM ilan_fotograflar WHERE ilan_id = i.id AND kapak = true LIMIT 1) as ilan_foto
       FROM teklifler t
       JOIN ilanlar i ON i.id = t.ilan_id
       JOIN users alici ON alici.id = t.alici_id
       JOIN users satici ON satici.id = t.satici_id
       WHERE t.${kondisyon}
       ORDER BY t.olusturuldu DESC`,
      [req.kullanici.id]
    );

    res.json({ teklifler: result.rows });
  } catch (err) {
    res.status(500).json({ hata: 'Teklifler alınamadı' });
  }
};

const teklifYanit = async (req, res) => {
  try {
    const { id } = req.params;
    const { yanit, karsi_fiyat, not } = req.body;

    if (!['kabul', 'ret', 'karsi_teklif'].includes(yanit)) {
      return res.status(400).json({ hata: 'Geçersiz yanıt' });
    }

    const teklif = await db.query(
      'SELECT * FROM teklifler WHERE id = $1 AND satici_id = $2',
      [id, req.kullanici.id]
    );

    if (!teklif.rows[0]) {
      return res.status(404).json({ hata: 'Teklif bulunamadı' });
    }

    if (teklif.rows[0].durum !== 'bekliyor') {
      return res.status(400).json({ hata: 'Bu teklif zaten yanıtlanmış' });
    }

    if (yanit === 'karsi_teklif' && !karsi_fiyat) {
      return res.status(400).json({ hata: 'Karşı teklif fiyatı zorunludur' });
    }

    await db.query(
      "UPDATE teklifler SET durum = $1, guncellendi = NOW() WHERE id = $2",
      [yanit === 'karsi_teklif' ? 'karsi_teklif' : yanit, id]
    );

    // Karşı teklif ise yeni teklif oluştur
    if (yanit === 'karsi_teklif') {
      await db.query(
        `INSERT INTO teklifler (ilan_id, alici_id, satici_id, teklif_fiyati, not)
         VALUES ($1, $2, $3, $4, $5)`,
        [teklif.rows[0].ilan_id, teklif.rows[0].satici_id, teklif.rows[0].alici_id, karsi_fiyat, not || null]
      );
    }

    // Alıcıya bildirim
    const mesajlar = { kabul: 'Teklifiniz kabul edildi!', ret: 'Teklifiniz reddedildi', karsi_teklif: 'Satıcı karşı teklif gönderdi' };
    await db.query(
      `INSERT INTO bildirimler (kullanici_id, tip, baslik, icerik, link)
       VALUES ($1, 'teklif', $2, $3, $4)`,
      [teklif.rows[0].alici_id, mesajlar[yanit], mesajlar[yanit], `/teklifler`]
    );

    res.json({ mesaj: 'Yanıtınız kaydedildi' });
  } catch (err) {
    console.error('Teklif yanıt hatası:', err);
    res.status(500).json({ hata: 'Yanıt kaydedilemedi' });
  }
};

// ===== BİLDİRİMLER =====

const bildirimleriGetir = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bildirimler WHERE kullanici_id = $1 ORDER BY olusturuldu DESC LIMIT 50',
      [req.kullanici.id]
    );

    const okunmamis = result.rows.filter(b => !b.okundu).length;

    res.json({ bildirimler: result.rows, okunmamis });
  } catch (err) {
    res.status(500).json({ hata: 'Bildirimler alınamadı' });
  }
};

const bildirimleriOku = async (req, res) => {
  try {
    await db.query(
      'UPDATE bildirimler SET okundu = true WHERE kullanici_id = $1',
      [req.kullanici.id]
    );
    res.json({ mesaj: 'Tüm bildirimler okundu işaretlendi' });
  } catch (err) {
    res.status(500).json({ hata: 'Bildirimler güncellenemedi' });
  }
};

const bildirimSil = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM bildirimler WHERE id = $1 AND kullanici_id = $2',
      [req.params.id, req.kullanici.id]
    );
    res.json({ mesaj: 'Bildirim silindi' });
  } catch (err) {
    res.status(500).json({ hata: 'Bildirim silinemedi' });
  }
};

// ===== KAYITLI ARAMALAR =====

const kayitliAramalariGetir = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM kayitli_aramalar WHERE kullanici_id = $1 ORDER BY olusturuldu DESC',
      [req.kullanici.id]
    );
    res.json({ aramalar: result.rows });
  } catch (err) {
    res.status(500).json({ hata: 'Aramalar alınamadı' });
  }
};

const aramaKaydet = async (req, res) => {
  try {
    const { ad, filtreler, bildirim_aktif = true } = req.body;

    const result = await db.query(
      'INSERT INTO kayitli_aramalar (kullanici_id, ad, filtreler, bildirim_aktif) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.kullanici.id, ad, JSON.stringify(filtreler), bildirim_aktif]
    );

    res.status(201).json({ mesaj: 'Arama kaydedildi', arama: result.rows[0] });
  } catch (err) {
    res.status(500).json({ hata: 'Arama kaydedilemedi' });
  }
};

const aramaSil = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM kayitli_aramalar WHERE id = $1 AND kullanici_id = $2',
      [req.params.id, req.kullanici.id]
    );
    res.json({ mesaj: 'Arama silindi' });
  } catch (err) {
    res.status(500).json({ hata: 'Arama silinemedi' });
  }
};

// ===== DEĞERLENDİRMELER =====

const degerlendirmeEkle = async (req, res) => {
  try {
    const { ilan_id, degerlendirilen_id, puan, yorum } = req.body;

    if (puan < 1 || puan > 5) {
      return res.status(400).json({ hata: 'Puan 1-5 arasında olmalıdır' });
    }

    await db.query(
      `INSERT INTO degerlendirmeler (ilan_id, degerlendiren_id, degerlendirilen_id, puan, yorum)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (ilan_id, degerlendiren_id) DO UPDATE SET puan = $4, yorum = $5`,
      [ilan_id, req.kullanici.id, degerlendirilen_id, puan, yorum || null]
    );

    res.json({ mesaj: 'Değerlendirme kaydedildi' });
  } catch (err) {
    res.status(500).json({ hata: 'Değerlendirme kaydedilemedi' });
  }
};

const degerlendirmeleriGetir = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*, u.ad as degerlendiren_ad, u.soyad as degerlendiren_soyad, u.avatar_url
       FROM degerlendirmeler d
       JOIN users u ON u.id = d.degerlendiren_id
       WHERE d.degerlendirilen_id = $1
       ORDER BY d.olusturuldu DESC`,
      [req.params.kullanici_id]
    );
    res.json({ degerlendirmeler: result.rows });
  } catch (err) {
    res.status(500).json({ hata: 'Değerlendirmeler alınamadı' });
  }
};

module.exports = {
  favoriEkle, favoriKaldir, favoriGetir, favoriKontrol,
  teklifGonder, teklifleriGetir, teklifYanit,
  bildirimleriGetir, bildirimleriOku, bildirimSil,
  kayitliAramalariGetir, aramaKaydet, aramaSil,
  degerlendirmeEkle, degerlendirmeleriGetir
};
