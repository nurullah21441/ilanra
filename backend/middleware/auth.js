const jwt = require('jsonwebtoken');
const db = require('../config/db');

// JWT doğrulama
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ hata: 'Giriş yapmanız gerekiyor' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar');

    const result = await db.query(
      'SELECT id, ad, soyad, email, rol, aktif FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ hata: 'Kullanıcı bulunamadı' });
    }

    if (!result.rows[0].aktif) {
      return res.status(403).json({ hata: 'Hesabınız askıya alınmış' });
    }

    req.kullanici = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ hata: 'Oturum süresi doldu, tekrar giriş yapın' });
    }
    return res.status(401).json({ hata: 'Geçersiz token' });
  }
};

// İsteğe bağlı auth (giriş yapmamış da geçebilir)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar');
      const result = await db.query('SELECT id, ad, soyad, email, rol FROM users WHERE id = $1', [decoded.id]);
      if (result.rows[0]) req.kullanici = result.rows[0];
    }
  } catch (err) {}
  next();
};

// Admin kontrolü
const adminMiddleware = (req, res, next) => {
  if (!req.kullanici || req.kullanici.rol !== 'admin') {
    return res.status(403).json({ hata: 'Bu işlem için admin yetkisi gerekiyor' });
  }
  next();
};

// İlan sahibi kontrolü
const ilanSahibiMiddleware = async (req, res, next) => {
  try {
    const result = await db.query('SELECT kullanici_id FROM ilanlar WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ hata: 'İlan bulunamadı' });
    }
    if (result.rows[0].kullanici_id !== req.kullanici.id && req.kullanici.rol !== 'admin') {
      return res.status(403).json({ hata: 'Bu ilanı düzenleme yetkiniz yok' });
    }
    next();
  } catch (err) {
    res.status(500).json({ hata: 'Sunucu hatası' });
  }
};

module.exports = { authMiddleware, optionalAuth, adminMiddleware, ilanSahibiMiddleware };
