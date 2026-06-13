-- İlanra.com Veritabanı Şeması
-- PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- KULLANICILAR
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad VARCHAR(50) NOT NULL,
  soyad VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefon VARCHAR(20),
  sifre_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  rol VARCHAR(20) DEFAULT 'kullanici' CHECK (rol IN ('kullanici','galeri','admin')),
  onaylandi BOOLEAN DEFAULT false,
  email_onaylandi BOOLEAN DEFAULT false,
  telefon_onaylandi BOOLEAN DEFAULT false,
  aktif BOOLEAN DEFAULT true,
  son_giris TIMESTAMP,
  olusturuldu TIMESTAMP DEFAULT NOW(),
  guncellendi TIMESTAMP DEFAULT NOW()
);

-- ŞEHİRLER
CREATE TABLE IF NOT EXISTS sehirler (
  id SERIAL PRIMARY KEY,
  ad VARCHAR(50) NOT NULL,
  plaka INTEGER
);

-- İLÇELER
CREATE TABLE IF NOT EXISTS ilceler (
  id SERIAL PRIMARY KEY,
  sehir_id INTEGER REFERENCES sehirler(id),
  ad VARCHAR(50) NOT NULL
);

-- KATEGORİLER
CREATE TABLE IF NOT EXISTS kategoriler (
  id SERIAL PRIMARY KEY,
  ust_id INTEGER REFERENCES kategoriler(id),
  ad VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  ikon VARCHAR(50),
  sira INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true
);

-- İLANLAR
CREATE TABLE IF NOT EXISTS ilanlar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kullanici_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kategori_id INTEGER REFERENCES kategoriler(id),
  sehir_id INTEGER REFERENCES sehirler(id),
  ilce_id INTEGER REFERENCES ilceler(id),
  baslik VARCHAR(200) NOT NULL,
  aciklama TEXT NOT NULL,
  fiyat DECIMAL(12,2),
  para_birimi VARCHAR(3) DEFAULT 'TRY',
  takas BOOLEAN DEFAULT false,
  pazarlik BOOLEAN DEFAULT true,
  durum VARCHAR(20) DEFAULT 'aktif' CHECK (durum IN ('aktif','pasif','satildi','silindi','beklemede')),
  onayli BOOLEAN DEFAULT true,
  slug VARCHAR(250) UNIQUE,
  goruntulenme INTEGER DEFAULT 0,
  favori_sayisi INTEGER DEFAULT 0,
  mesaj_sayisi INTEGER DEFAULT 0,
  olusturuldu TIMESTAMP DEFAULT NOW(),
  guncellendi TIMESTAMP DEFAULT NOW(),
  bitis_tarihi TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

-- ARAÇ ÖZELLİKLERİ (Vasıta kategorisi için)
CREATE TABLE IF NOT EXISTS arac_ozellikleri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  marka VARCHAR(50),
  seri VARCHAR(50),
  model VARCHAR(50),
  yil INTEGER,
  kilometre INTEGER,
  yakit_tipi VARCHAR(30),
  sanziman VARCHAR(30),
  kasa_tipi VARCHAR(30),
  renk VARCHAR(30),
  motor_hacmi INTEGER,
  motor_gucu INTEGER,
  hasar_kaydi BOOLEAN DEFAULT false,
  boyali BOOLEAN DEFAULT false,
  garantili BOOLEAN DEFAULT false,
  kimden VARCHAR(20) DEFAULT 'sahibinden'
);

-- EMLAK ÖZELLİKLERİ
CREATE TABLE IF NOT EXISTS emlak_ozellikleri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  emlak_tipi VARCHAR(30),
  ilan_tipi VARCHAR(20),
  metrekare INTEGER,
  oda_sayisi VARCHAR(10),
  bina_yasi INTEGER,
  kat INTEGER,
  toplam_kat INTEGER,
  isitma VARCHAR(30),
  banyo_sayisi INTEGER,
  balkon BOOLEAN DEFAULT false,
  asansor BOOLEAN DEFAULT false,
  otopark BOOLEAN DEFAULT false,
  esyali BOOLEAN DEFAULT false
);

-- İLAN FOTOĞRAFLARI
CREATE TABLE IF NOT EXISTS ilan_fotograflar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  kapak BOOLEAN DEFAULT false,
  sira INTEGER DEFAULT 0,
  olusturuldu TIMESTAMP DEFAULT NOW()
);

-- FAVORİLER
CREATE TABLE IF NOT EXISTS favoriler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kullanici_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  olusturuldu TIMESTAMP DEFAULT NOW(),
  UNIQUE(kullanici_id, ilan_id)
);

-- MESAJLAR (Konuşmalar)
CREATE TABLE IF NOT EXISTS konusmalar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE SET NULL,
  gonderen_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alici_id UUID REFERENCES users(id) ON DELETE CASCADE,
  olusturuldu TIMESTAMP DEFAULT NOW(),
  guncellendi TIMESTAMP DEFAULT NOW(),
  UNIQUE(ilan_id, gonderen_id, alici_id)
);

-- MESAJLAR
CREATE TABLE IF NOT EXISTS mesajlar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  konusma_id UUID REFERENCES konusmalar(id) ON DELETE CASCADE,
  gonderen_id UUID REFERENCES users(id) ON DELETE CASCADE,
  icerik TEXT NOT NULL,
  okundu BOOLEAN DEFAULT false,
  olusturuldu TIMESTAMP DEFAULT NOW()
);

-- TEKLİFLER
CREATE TABLE IF NOT EXISTS teklifler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  alici_id UUID REFERENCES users(id) ON DELETE CASCADE,
  satici_id UUID REFERENCES users(id) ON DELETE CASCADE,
  teklif_fiyati DECIMAL(12,2) NOT NULL,
  not TEXT,
  durum VARCHAR(20) DEFAULT 'bekliyor' CHECK (durum IN ('bekliyor','kabul','ret','karsi_teklif','suresi_doldu')),
  gecerlilik_suresi TIMESTAMP DEFAULT (NOW() + INTERVAL '48 hours'),
  olusturuldu TIMESTAMP DEFAULT NOW()
);

-- BİLDİRİMLER
CREATE TABLE IF NOT EXISTS bildirimler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kullanici_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tip VARCHAR(50),
  baslik VARCHAR(200),
  icerik TEXT,
  link VARCHAR(500),
  okundu BOOLEAN DEFAULT false,
  olusturuldu TIMESTAMP DEFAULT NOW()
);

-- KAYITLI ARAMALAR
CREATE TABLE IF NOT EXISTS kayitli_aramalar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kullanici_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ad VARCHAR(100),
  filtreler JSONB,
  bildirim_aktif BOOLEAN DEFAULT true,
  olusturuldu TIMESTAMP DEFAULT NOW()
);

-- DEĞERLENDİRMELER
CREATE TABLE IF NOT EXISTS degerlendirmeler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  degerlendiren_id UUID REFERENCES users(id) ON DELETE CASCADE,
  degerlendirilen_id UUID REFERENCES users(id) ON DELETE CASCADE,
  puan INTEGER CHECK (puan BETWEEN 1 AND 5),
  yorum TEXT,
  olusturuldu TIMESTAMP DEFAULT NOW(),
  UNIQUE(ilan_id, degerlendiren_id)
);

-- SIPARIŞLER (kargo takibi için)
CREATE TABLE IF NOT EXISTS siparisler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id),
  alici_id UUID REFERENCES users(id),
  satici_id UUID REFERENCES users(id),
  toplam_fiyat DECIMAL(12,2),
  kargo_firmasi VARCHAR(50),
  kargo_takip VARCHAR(100),
  durum VARCHAR(30) DEFAULT 'hazirlaniyor',
  olusturuldu TIMESTAMP DEFAULT NOW(),
  guncellendi TIMESTAMP DEFAULT NOW()
);

-- FİYAT GEÇMİŞİ
CREATE TABLE IF NOT EXISTS fiyat_gecmisi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  eski_fiyat DECIMAL(12,2),
  yeni_fiyat DECIMAL(12,2),
  olusturuldu TIMESTAMP DEFAULT NOW()
);

-- GÖRÜNTÜLENME İSTATİSTİKLERİ
CREATE TABLE IF NOT EXISTS goruntulenme_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  ip_adresi VARCHAR(50),
  cihaz VARCHAR(20),
  kaynak VARCHAR(50),
  olusturuldu TIMESTAMP DEFAULT NOW()
);

-- INDEXLER (performans)
CREATE INDEX IF NOT EXISTS idx_ilanlar_kategori ON ilanlar(kategori_id);
CREATE INDEX IF NOT EXISTS idx_ilanlar_sehir ON ilanlar(sehir_id);
CREATE INDEX IF NOT EXISTS idx_ilanlar_durum ON ilanlar(durum);
CREATE INDEX IF NOT EXISTS idx_ilanlar_kullanici ON ilanlar(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_ilanlar_fiyat ON ilanlar(fiyat);
CREATE INDEX IF NOT EXISTS idx_ilanlar_olusturuldu ON ilanlar(olusturuldu DESC);
CREATE INDEX IF NOT EXISTS idx_mesajlar_konusma ON mesajlar(konusma_id);
CREATE INDEX IF NOT EXISTS idx_bildirimler_kullanici ON bildirimler(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_favoriler_kullanici ON favoriler(kullanici_id);

-- FULL TEXT SEARCH
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS arama_vektoru TSVECTOR;
CREATE INDEX IF NOT EXISTS idx_ilanlar_fts ON ilanlar USING GIN(arama_vektoru);

-- ÖRNEK KATEGORİLER
INSERT INTO kategoriler (ad, slug, ikon, sira) VALUES
  ('Vasıta', 'vasita', '🚗', 1),
  ('Emlak', 'emlak', '🏠', 2),
  ('Elektronik', 'elektronik', '📱', 3),
  ('Mobilya', 'mobilya', '🛋️', 4),
  ('Giyim', 'giyim', '👗', 5),
  ('Spor', 'spor', '⚽', 6),
  ('Anne & Çocuk', 'anne-cocuk', '👶', 7),
  ('Tarım', 'tarim', '🌾', 8),
  ('Diğer', 'diger', '📦', 9)
ON CONFLICT (slug) DO NOTHING;

-- ALT KATEGORİLER (Vasıta)
INSERT INTO kategoriler (ust_id, ad, slug, ikon) VALUES
  (1, 'Otomobil', 'otomobil', '🚗'),
  (1, 'Arazi & SUV', 'suv', '🛻'),
  (1, 'Motosiklet', 'motosiklet', '🏍️'),
  (1, 'Kamyon', 'kamyon', '🚛'),
  (1, 'Karavan', 'karavan', '🚐')
ON CONFLICT (slug) DO NOTHING;

-- ÖRNEK ŞEHİRLER
INSERT INTO sehirler (ad, plaka) VALUES
  ('İstanbul', 34), ('Ankara', 6), ('İzmir', 35),
  ('Adana', 1), ('Bursa', 16), ('Antalya', 7),
  ('Konya', 42), ('Gaziantep', 27), ('Kayseri', 38)
ON CONFLICT DO NOTHING;
