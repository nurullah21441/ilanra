# ilanra.com

Türkiye'nin modern ilan platformu.

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Uygulama | Next.js 16 (App Router), React 19 |
| Sunucu | `server.mjs` (Next.js + Socket.IO) |
| Veritabanı | PostgreSQL + Prisma |
| Kimlik doğrulama | JWT (httpOnly cookie) |
| Fotoğraf | Cloudinary |
| E-posta | Resend (şifre sıfırlama, e-posta doğrulama) |
| Mesajlaşma | Socket.IO (gerçek zamanlı) + REST API |

## Gereksinimler

- Node.js 20+
- PostgreSQL 14+

## Hızlı başlangıç

### 1. PostgreSQL (Docker)

```bash
docker run --name ilanra-db -e POSTGRES_USER=ilanra -e POSTGRES_PASSWORD=ilanra123 -e POSTGRES_DB=ilanra -p 5432:5432 -d postgres
```

### 2. Ortam değişkenleri

```bash
cp .env.example .env
```

`.env` içinde en az `DATABASE_URL` ve `JWT_SECRET` doldurun. Fotoğraf yüklemek için Cloudinary, e-posta için Resend anahtarı gerekir (opsiyonel — dev modda linkler konsola yazılır).

### 3. Kurulum

```bash
npm install
npm run db:push
npx prisma generate
npm run seed
npm run dev
```

Tarayıcı: http://localhost:3000

Terminalde `Socket.IO aktif` görünmeli.

### Admin hesabı (seed)

| Alan | Değer |
|------|-------|
| E-posta | `admin@ilanra.com` |
| Şifre | `admin123` |

## NPM komutları

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (Socket.IO dahil) |
| `npm run build` | Production build (Webpack) |
| `npm run start` | Production sunucu |
| `npm run seed` | Kategoriler + alt kategoriler + admin |
| `npm run db:push` | Prisma şemasını veritabanına uygula |
| `npm run db:studio` | Prisma Studio |

## Önemli sayfalar

| Sayfa | Açıklama |
|-------|----------|
| `/` | Ana sayfa |
| `/ilanlar` | Arama, filtre, sıralama, kayıtlı arama |
| `/kategori/[slug]` | Kategori hub + alt kategoriler |
| `/ilan/[id]` | İlan detay, favori, şikayet |
| `/satici/[id]` | Satıcı profili |
| `/ilan-ver` | İlan oluştur (kategori özellikleri) |
| `/mesajlar` | Gerçek zamanlı mesajlaşma |
| `/profil` | Hesap, doğrulama, kayıtlı aramalar |
| `/admin` | Yönetim paneli (ilanlar, şikayetler, kullanıcılar) |
| `/eposta-dogrula` | E-posta doğrulama linki |

## Özellikler

- **Auth:** Kayıt, giriş, şifre sıfırlama, e-posta doğrulama
- **Gizlilik:** Telefon varsayılan gizli; mesaj öncelikli iletişim
- **İlanlar:** Yapılandırılmış `attributes`, benzer ilanlar, favoriler
- **Moderasyon:** İlan şikayeti + admin inceleme kuyruğu
- **Arama:** Kayıtlı aramalar, ilçe filtresi, sıralama
- **Kategoriler:** Parent + alt kategori seed (50+ alt kategori)

## Build notu (Windows)

Proje yolu Türkçe karakter içeriyorsa (`Masaüstü` vb.) Turbopack build hatası verebilir. Bu yüzden production build `--webpack` ile çalışır. Mümkünse projeyi ASCII yollu bir dizine taşıyın (ör. `C:\dev\ilanra`).

## Deploy

Production:

```bash
npm run build
set NODE_ENV=production
npm run start
```

Vercel'de Socket.IO custom server desteklenmez; tam mesajlaşma için Node sunucusu (Railway, Render, VPS) önerilir. Vercel'de polling ile mesajlar yine çalışır.

Gerekli environment variables: `.env.example` dosyasına bakın.

## Legacy klasörler

`backend/` ve `frontend/` eski Express + statik HTML sürümüdür. Aktif uygulama kök dizindeki Next.js projesidir; yeni geliştirmeler burada yapılır.
