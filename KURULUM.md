# İlanra.com — Kurulum Kılavuzu

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Node.js (v18+): https://nodejs.org
- PostgreSQL (v14+): https://postgresql.org
- Git (isteğe bağlı)

---

### 2. PostgreSQL Kurulumu

PostgreSQL'i kur ve çalıştır, sonra:

```sql
-- psql ile bağlan
psql -U postgres

-- Veritabanı oluştur
CREATE DATABASE ilanra;

-- Kılavuzu çık
\q

-- Şemayı kur
psql -U postgres -d ilanra -f backend/config/schema.sql
```

---

### 3. Backend Kurulumu

```bash
cd backend

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını aç ve şifreni gir:
# DB_PASSWORD=senin_postgresql_sifren
# JWT_SECRET=en_az_32_karakter_rastgele_bir_sifre

# Bağımlılıkları kur
npm install

# Sunucuyu başlat
npm start
```

Başarılı olursa şunu görürsün:
```
🚀 İlanra Backend Başlatıldı!
================================
🌐 Sunucu   : http://localhost:3000
📡 API      : http://localhost:3000/api
🔌 Socket   : ws://localhost:3000
🏥 Sağlık   : http://localhost:3000/api/health
================================
```

---

### 4. Frontend'i Aç

**Yöntem A — Backend üzerinden (önerilen):**
Tarayıcıda aç: http://localhost:3000

**Yöntem B — Direkt dosya:**
`frontend/anasayfa.html` dosyasına çift tıkla
(API bağlantısı çalışmaz ama sayfalar görsel olarak açılır)

**Yöntem C — VS Code Live Server:**
- VS Code'u aç
- "Live Server" eklentisini kur
- `frontend/anasayfa.html`'e sağ tıkla → "Open with Live Server"

---

### 5. API Test

```bash
# Sağlık kontrolü
curl http://localhost:3000/api/health

# Kayıt ol
curl -X POST http://localhost:3000/api/auth/kayit \
  -H "Content-Type: application/json" \
  -d '{"ad":"Ali","soyad":"Yılmaz","email":"ali@test.com","sifre":"sifre123"}'

# Giriş yap
curl -X POST http://localhost:3000/api/auth/giris \
  -H "Content-Type: application/json" \
  -d '{"email":"ali@test.com","sifre":"sifre123"}'

# İlanları listele
curl http://localhost:3000/api/ilanlar
```

---

## 📁 Proje Yapısı

```
ilanra/
├── backend/
│   ├── config/
│   │   ├── db.js          # Veritabanı bağlantısı
│   │   └── schema.sql     # Veritabanı şeması
│   ├── controllers/
│   │   ├── authController.js   # Kayıt/giriş
│   │   ├── ilanController.js   # İlan CRUD
│   │   ├── mesajController.js  # Mesajlaşma
│   │   └── diger.js            # Favori/teklif/bildirim
│   ├── middleware/
│   │   └── auth.js        # JWT doğrulama
│   ├── routes/
│   │   └── api.js         # Tüm rotalar
│   ├── uploads/           # Yüklenen fotoğraflar
│   ├── server.js          # Ana sunucu + Socket.io
│   ├── .env.example       # Ortam değişkenleri şablonu
│   └── package.json
├── frontend/
│   ├── js/
│   │   └── api.js         # Frontend API istemcisi
│   ├── anasayfa.html
│   ├── ilan_detay.html
│   ├── giris.html
│   └── ... (24 sayfa)
└── KURULUM.md
```

---

## 🔌 API Endpoint'leri

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/auth/kayit | Kayıt ol |
| POST | /api/auth/giris | Giriş yap |
| GET | /api/auth/profil | Profil getir (auth) |
| PUT | /api/auth/profil | Profil güncelle (auth) |
| PUT | /api/auth/sifre | Şifre değiştir (auth) |

### İlanlar
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/ilanlar | İlanları listele (filtreleme) |
| POST | /api/ilanlar | İlan oluştur (auth) |
| GET | /api/ilanlar/:id | İlan detayı |
| PUT | /api/ilanlar/:id | İlan güncelle (auth) |
| DELETE | /api/ilanlar/:id | İlan sil (auth) |
| POST | /api/ilanlar/:id/fotograflar | Fotoğraf yükle (auth) |
| GET | /api/ilanlar/benim | Kendi ilanları (auth) |
| GET | /api/ilanlar/:id/istatistik | İlan istatistikleri (auth) |

### Mesajlar
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/mesajlar | Konuşmaları listele |
| POST | /api/mesajlar | Mesaj gönder |
| GET | /api/mesajlar/:konusma_id | Mesajları getir |

### Diğer
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET/POST/DELETE | /api/favoriler | Favori yönetimi |
| GET/POST/PUT | /api/teklifler | Teklif sistemi |
| GET/PUT/DELETE | /api/bildirimler | Bildirimler |
| GET/POST/DELETE | /api/kayitli-aramalar | Kayıtlı aramalar |

---

## ⚡ Filtreleme Örnekleri

```
GET /api/ilanlar?kategori=1&sehir=1&min_fiyat=1000000&max_fiyat=5000000
GET /api/ilanlar?arama=BMW&siralama=ucuz&sayfa=2
GET /api/ilanlar?marka=BMW&yakit=Dizel&sanziman=Otomatik
```

---

## 🛠️ Geliştirme Modu

```bash
cd backend
npm install -g nodemon  # Bir kez
npm run dev             # Dosya değişince otomatik restart
```

---

## ❗ Sık Karşılaşılan Sorunlar

**"PostgreSQL bağlantısı kurulamadı"**
→ PostgreSQL servisini başlat:
- Windows: Services > PostgreSQL > Start
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

**"relation does not exist"**
→ Schema'yı çalıştır: `psql -U postgres -d ilanra -f backend/config/schema.sql`

**"port 3000 already in use"**
→ .env'de PORT=3001 yap

---

## 📞 Destek

Sorun olursa: destek@ilanra.com
