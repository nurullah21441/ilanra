# ilanra.com 🔴

Türkiye'nin modern ilan platformu — sahibinden.com rakibi.

## Tech Stack

- **Frontend + Backend**: Next.js 15 (App Router)
- **Veritabanı**: PostgreSQL + Prisma ORM
- **Kimlik Doğrulama**: JWT (httpOnly cookie)
- **Fotoğraf**: Cloudinary
- **Deploy**: Vercel

## Kurulum

### 1. Gereksinimler
- Node.js 20+
- PostgreSQL (ya da Docker)

### 2. PostgreSQL başlat (Docker)
```bash
docker run --name ilanra-db -e POSTGRES_USER=ilanra -e POSTGRES_PASSWORD=ilanra123 -e POSTGRES_DB=ilanra -p 5432:5432 -d postgres
```

### 3. .env dosyasını düzenle
```bash
cp .env.example .env
# .env dosyasını aç ve DATABASE_URL, JWT_SECRET, Cloudinary bilgilerini gir
```

### 4. Bağımlılıkları yükle
```bash
npm install
```

### 5. Veritabanı schema oluştur
```bash
npx prisma db push
```

### 6. Seed (kategoriler + admin hesabı)
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' lib/seed.ts
```

Admin giriş bilgileri:
- E-posta: `admin@ilanra.com`
- Şifre: `admin123`

### 7. Geliştirme sunucusu
```bash
npm run dev
```

http://localhost:3000 adresinden aç.

## Admin Panel

`/admin` adresine gidince admin giriş gerektirir.

**Admin yetenekleri:**
- Tüm ilanları görme, silme, aktif/pasif yapma
- **Öne Çıkar butonu** ile ilanı vitrine alma
- Kullanıcıları yönetme
- İstatistikleri görme

## Sayfalar

| Sayfa | Açıklama |
|-------|----------|
| `/` | Ana sayfa |
| `/ilanlar` | Tüm ilanlar + filtreleme |
| `/ilan/[id]` | İlan detay |
| `/ilan-ver` | İlan oluştur |
| `/giris` | Giriş |
| `/kayit` | Kayıt |
| `/profil` | Kullanıcı profili |
| `/admin` | Admin paneli |
| `/mesajlar` | Mesajlaşma |
| `/favoriler` | Favori ilanlar |

## API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Kayıt |
| POST | `/api/auth/login` | Giriş |
| POST | `/api/auth/logout` | Çıkış |
| GET | `/api/auth/me` | Mevcut kullanıcı |
| GET | `/api/listings` | İlan listesi (filtreleme destekler) |
| POST | `/api/listings` | İlan oluştur |
| GET | `/api/listings/[id]` | İlan detay |
| PATCH | `/api/listings/[id]` | İlan güncelle |
| DELETE | `/api/listings/[id]` | İlan sil |
| GET | `/api/categories` | Kategoriler |
| POST | `/api/upload` | Fotoğraf yükle |
| GET | `/api/favorites` | Favoriler |
| POST | `/api/favorites` | Favori ekle/çıkar |
| GET | `/api/messages` | Mesajlar |
| POST | `/api/messages` | Mesaj gönder |
| GET | `/api/admin/stats` | Admin istatistikleri |
| GET | `/api/admin/listings` | Admin ilan listesi |
| PATCH | `/api/admin/listings/[id]` | **Öne çıkar / durum değiştir** |
| DELETE | `/api/admin/listings/[id]` | İlan sil |
| GET | `/api/admin/users` | Kullanıcı listesi |

## Vercel Deploy

```bash
npm install -g vercel
vercel --prod
```

Vercel'de şu environment variables ekle:
- `DATABASE_URL`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
