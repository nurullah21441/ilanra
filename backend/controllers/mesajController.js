const db = require('../config/db');

// KONUŞMALARI GETİR
const konusmalariGetir = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT k.id, k.olusturuldu, k.guncellendi,
              i.id as ilan_id, i.baslik as ilan_baslik, i.fiyat as ilan_fiyat,
              (SELECT url FROM ilan_fotograflar WHERE ilan_id = i.id AND kapak = true LIMIT 1) as ilan_foto,
              CASE WHEN k.gonderen_id = $1 THEN alici.id ELSE gonderen.id END as karsi_id,
              CASE WHEN k.gonderen_id = $1 THEN alici.ad ELSE gonderen.ad END as karsi_ad,
              CASE WHEN k.gonderen_id = $1 THEN alici.soyad ELSE gonderen.soyad END as karsi_soyad,
              CASE WHEN k.gonderen_id = $1 THEN alici.avatar_url ELSE gonderen.avatar_url END as karsi_avatar,
              (SELECT icerik FROM mesajlar WHERE konusma_id = k.id ORDER BY olusturuldu DESC LIMIT 1) as son_mesaj,
              (SELECT olusturuldu FROM mesajlar WHERE konusma_id = k.id ORDER BY olusturuldu DESC LIMIT 1) as son_mesaj_tarihi,
              (SELECT COUNT(*) FROM mesajlar WHERE konusma_id = k.id AND gonderen_id != $1 AND okundu = false) as okunmamis
       FROM konusmalar k
       LEFT JOIN ilanlar i ON i.id = k.ilan_id
       LEFT JOIN users gonderen ON gonderen.id = k.gonderen_id
       LEFT JOIN users alici ON alici.id = k.alici_id
       WHERE k.gonderen_id = $1 OR k.alici_id = $1
       ORDER BY k.guncellendi DESC`,
      [req.kullanici.id]
    );

    res.json({ konusmalar: result.rows });
  } catch (err) {
    console.error('Konuşmalar hatası:', err);
    res.status(500).json({ hata: 'Konuşmalar alınamadı' });
  }
};

// MESAJLARI GETİR
const mesajlariGetir = async (req, res) => {
  try {
    const { konusma_id } = req.params;

    // Yetki kontrolü
    const konusma = await db.query(
      'SELECT * FROM konusmalar WHERE id = $1 AND (gonderen_id = $2 OR alici_id = $2)',
      [konusma_id, req.kullanici.id]
    );

    if (!konusma.rows[0]) {
      return res.status(403).json({ hata: 'Bu konuşmaya erişim yetkiniz yok' });
    }

    // Mesajları getir
    const result = await db.query(
      `SELECT m.*, u.ad as gonderen_ad, u.soyad as gonderen_soyad, u.avatar_url as gonderen_avatar
       FROM mesajlar m
       LEFT JOIN users u ON u.id = m.gonderen_id
       WHERE m.konusma_id = $1
       ORDER BY m.olusturuldu ASC`,
      [konusma_id]
    );

    // Okunmamışları okundu işaretle
    await db.query(
      'UPDATE mesajlar SET okundu = true WHERE konusma_id = $1 AND gonderen_id != $2',
      [konusma_id, req.kullanici.id]
    );

    res.json({ mesajlar: result.rows, konusma: konusma.rows[0] });
  } catch (err) {
    console.error('Mesajlar hatası:', err);
    res.status(500).json({ hata: 'Mesajlar alınamadı' });
  }
};

// MESAJ GÖNDER
const mesajGonder = async (req, res) => {
  try {
    const { alici_id, ilan_id, icerik } = req.body;

    if (!icerik || !icerik.trim()) {
      return res.status(400).json({ hata: 'Mesaj içeriği boş olamaz' });
    }

    if (alici_id === req.kullanici.id) {
      return res.status(400).json({ hata: 'Kendinize mesaj gönderemezsiniz' });
    }

    // Konuşma bul veya oluştur
    let konusma = await db.query(
      `SELECT id FROM konusmalar WHERE ilan_id = $1 AND (
        (gonderen_id = $2 AND alici_id = $3) OR
        (gonderen_id = $3 AND alici_id = $2)
      )`,
      [ilan_id || null, req.kullanici.id, alici_id]
    );

    if (!konusma.rows[0]) {
      konusma = await db.query(
        'INSERT INTO konusmalar (ilan_id, gonderen_id, alici_id) VALUES ($1, $2, $3) RETURNING *',
        [ilan_id || null, req.kullanici.id, alici_id]
      );
    }

    const konusma_id = konusma.rows[0].id;

    // Mesajı kaydet
    const result = await db.query(
      'INSERT INTO mesajlar (konusma_id, gonderen_id, icerik) VALUES ($1, $2, $3) RETURNING *',
      [konusma_id, req.kullanici.id, icerik.trim()]
    );

    // Konuşma güncelleme tarihi
    await db.query('UPDATE konusmalar SET guncellendi = NOW() WHERE id = $1', [konusma_id]);

    // İlan mesaj sayısını artır
    if (ilan_id) {
      await db.query('UPDATE ilanlar SET mesaj_sayisi = mesaj_sayisi + 1 WHERE id = $1', [ilan_id]);
    }

    // Bildirim oluştur
    await db.query(
      `INSERT INTO bildirimler (kullanici_id, tip, baslik, icerik, link)
       VALUES ($1, 'mesaj', 'Yeni mesajınız var', $2, $3)`,
      [alici_id, `${req.kullanici.ad} ${req.kullanici.soyad} size mesaj gönderdi`, `/mesajlar/${konusma_id}`]
    );

    res.status(201).json({
      mesaj: result.rows[0],
      konusma_id
    });
  } catch (err) {
    console.error('Mesaj gönderme hatası:', err);
    res.status(500).json({ hata: 'Mesaj gönderilemedi' });
  }
};

// OKUNMAMIS MESAJ SAYISI
const okunmamisSayisi = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(*) as sayi FROM mesajlar m
       JOIN konusmalar k ON k.id = m.konusma_id
       WHERE (k.gonderen_id = $1 OR k.alici_id = $1)
       AND m.gonderen_id != $1
       AND m.okundu = false`,
      [req.kullanici.id]
    );
    res.json({ okunmamis: parseInt(result.rows[0].sayi) });
  } catch (err) {
    res.status(500).json({ hata: 'Sayı alınamadı' });
  }
};

module.exports = { konusmalariGetir, mesajlariGetir, mesajGonder, okunmamisSayisi };
