require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// ========== SOCKET.IO (Gerçek zamanlı mesajlaşma) ==========
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

const aktifKullanicilar = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Bağlantı:', socket.id);

  // Kullanıcı bağlandığında
  socket.on('kullanici_baglandi', (kullanici_id) => {
    aktifKullanicilar.set(kullanici_id, socket.id);
    socket.kullanici_id = kullanici_id;
    console.log(`👤 Kullanıcı ${kullanici_id} bağlandı`);
  });

  // Konuşmaya katıl
  socket.on('konusmaya_katil', (konusma_id) => {
    socket.join(`konusma_${konusma_id}`);
  });

  // Mesaj gönder (socket üzerinden)
  socket.on('mesaj_gonder', async (data) => {
    const { konusma_id, icerik, alici_id } = data;

    // Alıcıya mesajı ilet
    const aliciSocket = aktifKullanicilar.get(alici_id);
    if (aliciSocket) {
      io.to(aliciSocket).emit('yeni_mesaj', {
        konusma_id,
        icerik,
        gonderen_id: socket.kullanici_id,
        zaman: new Date()
      });
    }

    // Konuşma odasına yayınla
    io.to(`konusma_${konusma_id}`).emit('yeni_mesaj', {
      konusma_id,
      icerik,
      gonderen_id: socket.kullanici_id,
      zaman: new Date()
    });
  });

  // Yazıyor...
  socket.on('yaziyor', (data) => {
    socket.to(`konusma_${data.konusma_id}`).emit('kullanici_yaziyor', {
      kullanici_id: socket.kullanici_id,
      konusma_id: data.konusma_id
    });
  });

  // Bağlantı kesildi
  socket.on('disconnect', () => {
    if (socket.kullanici_id) {
      aktifKullanicilar.delete(socket.kullanici_id);
    }
    console.log('🔌 Bağlantı kesildi:', socket.id);
  });
});

// Socket'i routes'a aktar
app.use((req, res, next) => {
  req.io = io;
  req.aktifKullanicilar = aktifKullanicilar;
  next();
});

// ========== MIDDLEWARE ==========
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { hata: 'Çok fazla istek gönderdiniz, lütfen bekleyin' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { hata: 'Çok fazla giriş denemesi, 15 dakika bekleyin' }
});

app.use('/api/', limiter);
app.use('/api/auth/giris', authLimiter);
app.use('/api/auth/kayit', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Statik dosyalar (yüklenen fotoğraflar)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Frontend statik dosyalar
app.use(express.static(path.join(__dirname, '../frontend')));

// ========== ROUTES ==========
app.use('/api', routes);

// Frontend için catch-all (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    const indexPath = path.join(__dirname, '../frontend', 'anasayfa.html');
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.json({ mesaj: 'İlanra API çalışıyor', versiyon: '1.0.0' });
    }
  }
});

// ========== HATA YÖNETİMİ ==========
app.use((err, req, res, next) => {
  console.error('❌ Hata:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ hata: 'Dosya boyutu 5MB\'ı geçemez' });
  }

  if (err.message && err.message.includes('Sadece')) {
    return res.status(400).json({ hata: err.message });
  }

  res.status(500).json({ hata: 'Sunucu hatası', detay: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// ========== SUNUCU BAŞLAT ==========
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 İlanra Backend Başlatıldı!');
  console.log('================================');
  console.log(`🌐 Sunucu   : http://localhost:${PORT}`);
  console.log(`📡 API      : http://localhost:${PORT}/api`);
  console.log(`🔌 Socket   : ws://localhost:${PORT}`);
  console.log(`🏥 Sağlık   : http://localhost:${PORT}/api/health`);
  console.log('================================');
  console.log('');
});

module.exports = { app, server, io };
