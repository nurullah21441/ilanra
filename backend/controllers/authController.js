const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Token oluştur
const tokenOlustur = (kullanici) => {
  return jwt.sign(
    { id: kullanici.id, email: kullanici.email, rol: kullanici.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// KAYIT OL
const kayitOl = async (req, res) => {
  try {
    const { ad, soyad, email, sifre, telefon } = req.body;

    if (!ad || !soyad || !email || !sifre) {
      return res.status(400).json({ hata: 'Tüm alanlar zorunludur' });
    }

    if (sifre.length < 6) {
      return res.status(400).json({ hata: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Email kontrolü
    const mevcutKullanici = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (mevcutKullanici.rows[0]) {
      return res.status(400).json({ hata: 'Bu e-posta adresi zaten kayıtlı' });
    }

    const sifreHash = await bcrypt.hash(sifre, 12);

    const result = await db.query(
      `INSERT INTO users (ad, soyad, email, sifre_hash, telefon)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, ad, soyad, email, rol, olusturuldu`,
      [ad.trim(), soyad.trim(), email.toLowerCase(), sifreHash, telefon || null]
    );

    const kullanici = result.rows[0];
    const token = tokenOlustur(kullanici);

    res.status(201).json({
      mesaj: 'Hesabınız başarıyla oluşturuldu',
      token,
      kullanici: {
        id: kullanici.id,
        ad: kullanici.ad,
        soyad: kullanici.soyad,
        email: kullanici.email,
        rol: kullanici.rol
      }
    });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    res.status(500).json({ hata: 'Kayıt sırasında hata oluştu' });
  }
};

// GİRİŞ YAP
const girisYap = async (req, res) => {
  try {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
      return res.status(400).json({ hata: 'E-posta ve şifre zorunludur' });
    }

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND aktif = true',
      [email.toLowerCase()]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ hata: 'E-posta veya şifre hatalı' });
    }

    const kullanici = result.rows[0];
    const sifreDoğru = await bcrypt.compare(sifre, kullanici.sifre_hash);

    if (!sifreDoğru) {
      return res.status(401).json({ hata: 'E-posta veya şifre hatalı' });
    }

    // Son giriş güncelle
    await db.query('UPDATE users SET son_giris = NOW() WHERE id = $1', [kullanici.id]);

    const token = tokenOlustur(kullanici);

    res.json({
      mesaj: 'Giriş başarılı',
      token,
      kullanici: {
        id: kullanici.id,
        ad: kullanici.ad,
        soyad: kullanici.soyad,
        email: kullanici.email,
        rol: kullanici.rol,
        avatar_url: kullanici.avatar_url
      }
    });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({ hata: 'Giriş sırasında hata oluştu' });
  }
};

// PROFİL GETİR
const profilGetir = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.ad, u.soyad, u.email, u.telefon, u.avatar_url, u.rol,
              u.onaylandi, u.olusturuldu,
              COUNT(DISTINCT i.id) as ilan_sayisi,
              COUNT(DISTINCT f.id) as favori_sayisi,
              COALESCE(AVG(d.puan), 0) as ortalama_puan,
              COUNT(DISTINCT d.id) as degerlendirme_sayisi
       FROM users u
       LEFT JOIN ilanlar i ON i.kullanici_id = u.id AND i.durum = 'aktif'
       LEFT JOIN favoriler f ON f.kullanici_id = u.id
       LEFT JOIN degerlendirmeler d ON d.degerlendirilen_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.kullanici.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ hata: 'Kullanıcı bulunamadı' });
    }

    res.json({ kullanici: result.rows[0] });
  } catch (err) {
    console.error('Profil hatası:', err);
    res.status(500).json({ hata: 'Profil alınamadı' });
  }
};

// PROFİL GÜNCELLE
const profilGuncelle = async (req, res) => {
  try {
    const { ad, soyad, telefon } = req.body;

    const result = await db.query(
      `UPDATE users SET ad = COALESCE($1, ad), soyad = COALESCE($2, soyad),
       telefon = COALESCE($3, telefon), guncellendi = NOW()
       WHERE id = $4
       RETURNING id, ad, soyad, email, telefon, avatar_url`,
      [ad, soyad, telefon, req.kullanici.id]
    );

    res.json({ mesaj: 'Profil güncellendi', kullanici: result.rows[0] });
  } catch (err) {
    console.error('Profil güncelleme hatası:', err);
    res.status(500).json({ hata: 'Profil güncellenemedi' });
  }
};

// ŞİFRE DEĞİŞTİR
const sifreDegistir = async (req, res) => {
  try {
    const { eski_sifre, yeni_sifre } = req.body;

    if (!eski_sifre || !yeni_sifre) {
      return res.status(400).json({ hata: 'Eski ve yeni şifre zorunludur' });
    }

    if (yeni_sifre.length < 6) {
      return res.status(400).json({ hata: 'Yeni şifre en az 6 karakter olmalıdır' });
    }

    const result = await db.query('SELECT sifre_hash FROM users WHERE id = $1', [req.kullanici.id]);
    const doğru = await bcrypt.compare(eski_sifre, result.rows[0].sifre_hash);

    if (!doğru) {
      return res.status(400).json({ hata: 'Eski şifre hatalı' });
    }

    const yeniHash = await bcrypt.hash(yeni_sifre, 12);
    await db.query('UPDATE users SET sifre_hash = $1, guncellendi = NOW() WHERE id = $2', [yeniHash, req.kullanici.id]);

    res.json({ mesaj: 'Şifreniz başarıyla değiştirildi' });
  } catch (err) {
    console.error('Şifre değiştirme hatası:', err);
    res.status(500).json({ hata: 'Şifre değiştirilemedi' });
  }
};

// HESAP SİL
const hesapSil = async (req, res) => {
  try {
    await db.query('UPDATE users SET aktif = false, guncellendi = NOW() WHERE id = $1', [req.kullanici.id]);
    res.json({ mesaj: 'Hesabınız başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ hata: 'Hesap silinemedi' });
  }
};

module.exports = { kayitOl, girisYap, profilGetir, profilGuncelle, sifreDegistir, hesapSil };
