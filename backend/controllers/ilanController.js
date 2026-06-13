const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// TÜM İLANLAR (filtreli, sayfalı)
const ilanlariGetir = async (req, res) => {
  try {
    const {
      kategori, sehir, ilce, min_fiyat, max_fiyat,
      arama, siralama = 'yeni', sayfa = 1, limit = 20,
      takas, marka, yakit, sanziman, min_yil, max_yil
    } = req.query;

    const offset = (parseInt(sayfa) - 1) * parseInt(limit);
    const params = [];
    let whereKloz = "WHERE i.durum = 'aktif' AND i.bitis_tarihi > NOW()";
    let joinKloz = '';

    if (kategori) {
      params.push(kategori);
      whereKloz += ` AND (i.kategori_id = $${params.length} OR k.slug = $${params.length})`;
      joinKloz += ' LEFT JOIN kategoriler k ON k.id = i.kategori_id';
    }

    if (sehir) {
      params.push(sehir);
      whereKloz += ` AND i.sehir_id = $${params.length}`;
    }

    if (min_fiyat) {
      params.push(parseFloat(min_fiyat));
      whereKloz += ` AND i.fiyat >= $${params.length}`;
    }

    if (max_fiyat) {
      params.push(parseFloat(max_fiyat));
      whereKloz += ` AND i.fiyat <= $${params.length}`;
    }

    if (takas === 'true') {
      whereKloz += ' AND i.takas = true';
    }

    if (arama) {
      params.push(`%${arama}%`);
      whereKloz += ` AND (i.baslik ILIKE $${params.length} OR i.aciklama ILIKE $${params.length})`;
    }

    // Araç filtreleri
    if (marka || yakit || sanziman || min_yil || max_yil) {
      joinKloz += ' LEFT JOIN arac_ozellikleri ao ON ao.ilan_id = i.id';
      if (marka) {
        params.push(marka);
        whereKloz += ` AND ao.marka ILIKE $${params.length}`;
      }
      if (yakit) {
        params.push(yakit);
        whereKloz += ` AND ao.yakit_tipi = $${params.length}`;
      }
      if (sanziman) {
        params.push(sanziman);
        whereKloz += ` AND ao.sanziman = $${params.length}`;
      }
      if (min_yil) {
        params.push(parseInt(min_yil));
        whereKloz += ` AND ao.yil >= $${params.length}`;
      }
      if (max_yil) {
        params.push(parseInt(max_yil));
        whereKloz += ` AND ao.yil <= $${params.length}`;
      }
    }

    const siralamaMap = {
      'yeni': 'i.olusturuldu DESC',
      'eski': 'i.olusturuldu ASC',
      'ucuz': 'i.fiyat ASC',
      'pahali': 'i.fiyat DESC',
      'populer': 'i.goruntulenme DESC'
    };

    const siralamaSql = siralamaMap[siralama] || 'i.olusturuldu DESC';

    const query = `
      SELECT i.id, i.baslik, i.fiyat, i.para_birimi, i.takas, i.durum,
             i.olusturuldu, i.goruntulenme, i.favori_sayisi,
             s.ad as sehir, il.ad as ilce,
             u.ad as satici_ad, u.soyad as satici_soyad,
             u.onaylandi as satici_onaylandi,
             (SELECT url FROM ilan_fotograflar WHERE ilan_id = i.id AND kapak = true LIMIT 1) as kapak_foto,
             ao.marka, ao.seri, ao.yil, ao.kilometre, ao.yakit_tipi, ao.sanziman
      FROM ilanlar i
      LEFT JOIN users u ON u.id = i.kullanici_id
      LEFT JOIN sehirler s ON s.id = i.sehir_id
      LEFT JOIN ilceler il ON il.id = i.ilce_id
      LEFT JOIN arac_ozellikleri ao ON ao.ilan_id = i.id
      ${joinKloz}
      ${whereKloz}
      ORDER BY ${siralamaSql}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(parseInt(limit), offset);

    const countQuery = `SELECT COUNT(*) FROM ilanlar i ${joinKloz} ${whereKloz}`;
    const countParams = params.slice(0, -2);

    const [ilanlarResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ]);

    const toplam = parseInt(countResult.rows[0].count);

    res.json({
      ilanlar: ilanlarResult.rows,
      sayfalama: {
        toplam,
        sayfa: parseInt(sayfa),
        limit: parseInt(limit),
        toplam_sayfa: Math.ceil(toplam / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('İlanlar getirme hatası:', err);
    res.status(500).json({ hata: 'İlanlar alınamadı' });
  }
};

// TEK İLAN
const ilanGetir = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT i.*, 
              s.ad as sehir, il.ad as ilce,
              k.ad as kategori, k.slug as kategori_slug,
              u.id as satici_id, u.ad as satici_ad, u.soyad as satici_soyad,
              u.avatar_url as satici_avatar, u.onaylandi as satici_onaylandi,
              u.olusturuldu as satici_kayit,
              COALESCE(AVG(d.puan), 0) as satici_puan,
              COUNT(DISTINCT d.id) as satici_degerlendirme
       FROM ilanlar i
       LEFT JOIN users u ON u.id = i.kullanici_id
       LEFT JOIN sehirler s ON s.id = i.sehir_id
       LEFT JOIN ilceler il ON il.id = i.ilce_id
       LEFT JOIN kategoriler k ON k.id = i.kategori_id
       LEFT JOIN degerlendirmeler d ON d.degerlendirilen_id = u.id
       WHERE i.id = $1 OR i.slug = $1
       GROUP BY i.id, s.ad, il.ad, k.ad, k.slug, u.id, u.ad, u.soyad, u.avatar_url, u.onaylandi, u.olusturuldu`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ hata: 'İlan bulunamadı' });
    }

    const ilan = result.rows[0];

    // Fotoğrafları getir
    const fotograflar = await db.query(
      'SELECT id, url, kapak, sira FROM ilan_fotograflar WHERE ilan_id = $1 ORDER BY kapak DESC, sira ASC',
      [ilan.id]
    );

    // Araç özelliklerini getir
    const aracOz = await db.query('SELECT * FROM arac_ozellikleri WHERE ilan_id = $1', [ilan.id]);
    const emlakOz = await db.query('SELECT * FROM emlak_ozellikleri WHERE ilan_id = $1', [ilan.id]);

    // Görüntülenme artır
    await db.query('UPDATE ilanlar SET goruntulenme = goruntulenme + 1 WHERE id = $1', [ilan.id]);

    // Log
    await db.query(
      'INSERT INTO goruntulenme_log (ilan_id, ip_adresi, cihaz) VALUES ($1, $2, $3)',
      [ilan.id, req.ip, req.headers['user-agent']?.includes('Mobile') ? 'mobil' : 'masaustu']
    ).catch(() => {});

    res.json({
      ilan,
      fotograflar: fotograflar.rows,
      arac_ozellikleri: aracOz.rows[0] || null,
      emlak_ozellikleri: emlakOz.rows[0] || null
    });
  } catch (err) {
    console.error('İlan getirme hatası:', err);
    res.status(500).json({ hata: 'İlan alınamadı' });
  }
};

// İLAN OLUŞTUR
const ilanOlustur = async (req, res) => {
  try {
    const {
      kategori_id, sehir_id, ilce_id, baslik, aciklama,
      fiyat, para_birimi, takas, pazarlik,
      arac_ozellikleri, emlak_ozellikleri
    } = req.body;

    if (!baslik || !aciklama || !kategori_id) {
      return res.status(400).json({ hata: 'Başlık, açıklama ve kategori zorunludur' });
    }

    // Slug oluştur
    const slugBase = baslik
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${slugBase}-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO ilanlar (kullanici_id, kategori_id, sehir_id, ilce_id, baslik, aciklama, fiyat, para_birimi, takas, pazarlik, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.kullanici.id, kategori_id, sehir_id || null, ilce_id || null, baslik, aciklama,
       fiyat || null, para_birimi || 'TRY', takas === true, pazarlik !== false, slug]
    );

    const ilan = result.rows[0];

    // Araç özellikleri
    if (arac_ozellikleri) {
      const ao = typeof arac_ozellikleri === 'string' ? JSON.parse(arac_ozellikleri) : arac_ozellikleri;
      await db.query(
        `INSERT INTO arac_ozellikleri (ilan_id, marka, seri, model, yil, kilometre, yakit_tipi, sanziman, kasa_tipi, renk, motor_hacmi, motor_gucu, hasar_kaydi, boyali, garantili, kimden)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [ilan.id, ao.marka, ao.seri, ao.model, ao.yil, ao.kilometre, ao.yakit_tipi, ao.sanziman,
         ao.kasa_tipi, ao.renk, ao.motor_hacmi, ao.motor_gucu, ao.hasar_kaydi || false,
         ao.boyali || false, ao.garantili || false, ao.kimden || 'sahibinden']
      );
    }

    // Emlak özellikleri
    if (emlak_ozellikleri) {
      const eo = typeof emlak_ozellikleri === 'string' ? JSON.parse(emlak_ozellikleri) : emlak_ozellikleri;
      await db.query(
        `INSERT INTO emlak_ozellikleri (ilan_id, emlak_tipi, ilan_tipi, metrekare, oda_sayisi, bina_yasi, kat, toplam_kat, isitma, banyo_sayisi, balkon, asansor, otopark, esyali)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [ilan.id, eo.emlak_tipi, eo.ilan_tipi, eo.metrekare, eo.oda_sayisi, eo.bina_yasi,
         eo.kat, eo.toplam_kat, eo.isitma, eo.banyo_sayisi, eo.balkon || false,
         eo.asansor || false, eo.otopark || false, eo.esyali || false]
      );
    }

    res.status(201).json({ mesaj: 'İlan başarıyla oluşturuldu', ilan });
  } catch (err) {
    console.error('İlan oluşturma hatası:', err);
    res.status(500).json({ hata: 'İlan oluşturulamadı' });
  }
};

// İLAN GÜNCELLE
const ilanGuncelle = async (req, res) => {
  try {
    const { id } = req.params;
    const { baslik, aciklama, fiyat, takas, pazarlik, durum } = req.body;

    // Fiyat değişmişse geçmişe kaydet
    if (fiyat) {
      const eskiIlan = await db.query('SELECT fiyat FROM ilanlar WHERE id = $1', [id]);
      if (eskiIlan.rows[0] && eskiIlan.rows[0].fiyat != fiyat) {
        await db.query(
          'INSERT INTO fiyat_gecmisi (ilan_id, eski_fiyat, yeni_fiyat) VALUES ($1, $2, $3)',
          [id, eskiIlan.rows[0].fiyat, fiyat]
        );
      }
    }

    const result = await db.query(
      `UPDATE ilanlar SET
        baslik = COALESCE($1, baslik),
        aciklama = COALESCE($2, aciklama),
        fiyat = COALESCE($3, fiyat),
        takas = COALESCE($4, takas),
        pazarlik = COALESCE($5, pazarlik),
        durum = COALESCE($6, durum),
        guncellendi = NOW()
       WHERE id = $7
       RETURNING *`,
      [baslik, aciklama, fiyat, takas, pazarlik, durum, id]
    );

    res.json({ mesaj: 'İlan güncellendi', ilan: result.rows[0] });
  } catch (err) {
    console.error('İlan güncelleme hatası:', err);
    res.status(500).json({ hata: 'İlan güncellenemedi' });
  }
};

// İLAN SİL
const ilanSil = async (req, res) => {
  try {
    await db.query(
      "UPDATE ilanlar SET durum = 'silindi', guncellendi = NOW() WHERE id = $1",
      [req.params.id]
    );
    res.json({ mesaj: 'İlan silindi' });
  } catch (err) {
    res.status(500).json({ hata: 'İlan silinemedi' });
  }
};

// FOTOĞRAF YÜKLE
const fotografYukle = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ hata: 'Fotoğraf seçilmedi' });
    }

    const { ilan_id } = req.params;
    const fotograflar = [];

    for (let i = 0; i < req.files.length; i++) {
      const dosya = req.files[i];
      const url = `/uploads/${dosya.filename}`;
      const kapak = i === 0;

      const result = await db.query(
        'INSERT INTO ilan_fotograflar (ilan_id, url, kapak, sira) VALUES ($1, $2, $3, $4) RETURNING *',
        [ilan_id, url, kapak, i]
      );
      fotograflar.push(result.rows[0]);
    }

    res.json({ mesaj: 'Fotoğraflar yüklendi', fotograflar });
  } catch (err) {
    console.error('Fotoğraf yükleme hatası:', err);
    res.status(500).json({ hata: 'Fotoğraf yüklenemedi' });
  }
};

// KULLANICININKİ
const benimilanlar = async (req, res) => {
  try {
    const { durum = 'aktif', sayfa = 1, limit = 10 } = req.query;
    const offset = (parseInt(sayfa) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT i.*, s.ad as sehir,
              (SELECT url FROM ilan_fotograflar WHERE ilan_id = i.id AND kapak = true LIMIT 1) as kapak_foto
       FROM ilanlar i
       LEFT JOIN sehirler s ON s.id = i.sehir_id
       WHERE i.kullanici_id = $1 AND i.durum != 'silindi'
       ${durum !== 'hepsi' ? "AND i.durum = '" + durum + "'" : ''}
       ORDER BY i.olusturuldu DESC
       LIMIT $2 OFFSET $3`,
      [req.kullanici.id, parseInt(limit), offset]
    );

    res.json({ ilanlar: result.rows });
  } catch (err) {
    console.error('İlanlarım hatası:', err);
    res.status(500).json({ hata: 'İlanlar alınamadı' });
  }
};

// FİYAT GEÇMİŞİ
const fiyatGecmisi = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM fiyat_gecmisi WHERE ilan_id = $1 ORDER BY olusturuldu ASC',
      [req.params.id]
    );
    res.json({ gecmis: result.rows });
  } catch (err) {
    res.status(500).json({ hata: 'Fiyat geçmişi alınamadı' });
  }
};

// İSTATİSTİKLER
const ilanIstatistik = async (req, res) => {
  try {
    const { id } = req.params;

    const [genel, gunluk, kaynaklar] = await Promise.all([
      db.query(
        'SELECT goruntulenme, favori_sayisi, mesaj_sayisi FROM ilanlar WHERE id = $1 AND kullanici_id = $2',
        [id, req.kullanici.id]
      ),
      db.query(
        `SELECT DATE(olusturuldu) as gun, COUNT(*) as sayi
         FROM goruntulenme_log WHERE ilan_id = $1 AND olusturuldu > NOW() - INTERVAL '30 days'
         GROUP BY DATE(olusturuldu) ORDER BY gun`,
        [id]
      ),
      db.query(
        `SELECT kaynak, COUNT(*) as sayi FROM goruntulenme_log WHERE ilan_id = $1
         GROUP BY kaynak ORDER BY sayi DESC`,
        [id]
      )
    ]);

    res.json({
      genel: genel.rows[0] || {},
      gunluk: gunluk.rows,
      kaynaklar: kaynaklar.rows
    });
  } catch (err) {
    res.status(500).json({ hata: 'İstatistikler alınamadı' });
  }
};

module.exports = {
  ilanlariGetir, ilanGetir, ilanOlustur, ilanGuncelle, ilanSil,
  fotografYukle, benimilanlar, fiyatGecmisi, ilanIstatistik
};
