-- ============================================
-- İLANRA.COM — DETAYLI KATEGORİ ÖZELLİKLERİ
-- ============================================

-- =====================
-- 🚗 VASITA KATEGORİLERİ
-- =====================

-- OTOMOBİL
CREATE TABLE IF NOT EXISTS otomobil (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,

  -- Temel
  marka VARCHAR(50),
  seri VARCHAR(50),
  model VARCHAR(100),
  yil INTEGER CHECK (yil BETWEEN 1900 AND 2030),
  kilometre INTEGER CHECK (kilometre >= 0),
  renk VARCHAR(30),
  renk_orijinal BOOLEAN DEFAULT true,

  -- Motor & Mekanik
  motor_hacmi INTEGER,       -- cc
  motor_gucu INTEGER,        -- HP
  yakit_tipi VARCHAR(30)     CHECK (yakit_tipi IN ('Benzin','Dizel','LPG & Benzin','Elektrik','Hibrit','Diğer')),
  sanziman VARCHAR(30)       CHECK (sanziman IN ('Otomatik','Manuel','Yarı Otomatik','CVT')),
  cekis VARCHAR(20)          CHECK (cekis IN ('Önden Çekiş','Arkadan İtiş','4x4','AWD')),
  vites_sayisi INTEGER,
  silindir_sayisi INTEGER,
  beygir_gucu INTEGER,

  -- Kasa & Tasarım
  kasa_tipi VARCHAR(30)      CHECK (kasa_tipi IN ('Sedan','Hatchback','Station Wagon','Coupe','Cabrio','SUV','MPV','Pickup','Van')),
  kapi_sayisi INTEGER        CHECK (kapi_sayisi IN (2,3,4,5)),
  koltuk_sayisi INTEGER      CHECK (koltuk_sayisi BETWEEN 1 AND 9),
  bagaj_hacmi INTEGER,       -- litre

  -- Durum
  kimden VARCHAR(20)         CHECK (kimden IN ('Sahibinden','Galeriden','Bayiden')),
  hasar_kaydi BOOLEAN DEFAULT false,
  hasar_detay TEXT,
  boya_degisen VARCHAR(200), -- hangi parçalar
  tramer_kaydi BOOLEAN DEFAULT false,
  garantili BOOLEAN DEFAULT false,
  garanti_bitis DATE,
  ithal BOOLEAN DEFAULT false,
  orijinal_parca BOOLEAN DEFAULT true,
  muayene_tarihi DATE,

  -- Donanım - Güvenlik
  hava_yastigi VARCHAR(50),
  abs BOOLEAN DEFAULT false,
  esp BOOLEAN DEFAULT false,
  traction_control BOOLEAN DEFAULT false,
  kor_nokta_uyari BOOLEAN DEFAULT false,
  serit_takip BOOLEAN DEFAULT false,
  yorukluk_uyari BOOLEAN DEFAULT false,
  gece_gorus BOOLEAN DEFAULT false,
  adaptif_hiz_sabitleyici BOOLEAN DEFAULT false,
  otomatik_fren BOOLEAN DEFAULT false,
  yaya_algilama BOOLEAN DEFAULT false,
  geri_gorus_kamera BOOLEAN DEFAULT false,
  yan_gorus_kamera BOOLEAN DEFAULT false,
  kamera_360 BOOLEAN DEFAULT false,
  park_sensoru_on BOOLEAN DEFAULT false,
  park_sensoru_arka BOOLEAN DEFAULT false,
  park_asistani BOOLEAN DEFAULT false,

  -- Konfor
  klima VARCHAR(30),         -- Manuel/Otomatik/Çift Bölge
  isitmali_on_koltuk BOOLEAN DEFAULT false,
  isitmali_arka_koltuk BOOLEAN DEFAULT false,
  sogutmali_koltuk BOOLEAN DEFAULT false,
  masajli_koltuk BOOLEAN DEFAULT false,
  hafiza_koltuk BOOLEAN DEFAULT false,
  elektrikli_koltuk BOOLEAN DEFAULT false,
  isitmali_direksiyon BOOLEAN DEFAULT false,
  hafiza_direksiyon BOOLEAN DEFAULT false,
  sunroof BOOLEAN DEFAULT false,
  panoramik_tavan BOOLEAN DEFAULT false,
  elektrikli_tavan BOOLEAN DEFAULT false,
  cam_tavan BOOLEAN DEFAULT false,
  elektrikli_bagaj BOOLEAN DEFAULT false,
  keyless_entry BOOLEAN DEFAULT false,
  start_stop BOOLEAN DEFAULT false,
  otomatik_park BOOLEAN DEFAULT false,
  hud BOOLEAN DEFAULT false,       -- Hayalet gösterge
  dijital_gosterge BOOLEAN DEFAULT false,

  -- Multimedya & Bağlantı
  dokunmatik_ekran BOOLEAN DEFAULT false,
  ekran_inch DECIMAL(4,1),
  navigasyon BOOLEAN DEFAULT false,
  apple_carplay BOOLEAN DEFAULT false,
  android_auto BOOLEAN DEFAULT false,
  kablosuz_sarj BOOLEAN DEFAULT false,
  bluetooth BOOLEAN DEFAULT false,
  usb_port INTEGER DEFAULT 0,
  ses_sistemi VARCHAR(50),   -- Harman Kardon, Bose vs
  hoparlor_sayisi INTEGER,
  dab_radyo BOOLEAN DEFAULT false,

  -- Dış & Görünüm
  led_far BOOLEAN DEFAULT false,
  lazer_far BOOLEAN DEFAULT false,
  adaptif_far BOOLEAN DEFAULT false,
  sis_far BOOLEAN DEFAULT false,
  calisma_fari BOOLEAN DEFAULT false,
  ambiyans_aydinlatma BOOLEAN DEFAULT false,
  elektrikli_ayna BOOLEAN DEFAULT false,
  isitmali_ayna BOOLEAN DEFAULT false,
  katlanir_ayna BOOLEAN DEFAULT false,
  karartilmis_ayna BOOLEAN DEFAULT false,
  jant_tipi VARCHAR(30),     -- Çelik/Alaşım/Karbon
  jant_inchi INTEGER,

  -- Diğer
  takas BOOLEAN DEFAULT false,
  takas_detay TEXT,
  kredi_uygun BOOLEAN DEFAULT true
);

-- MOTOSİKLET
CREATE TABLE IF NOT EXISTS motosiklet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  marka VARCHAR(50),
  model VARCHAR(100),
  yil INTEGER,
  kilometre INTEGER,
  renk VARCHAR(30),
  motor_hacmi INTEGER,
  motor_gucu INTEGER,
  tip VARCHAR(30) CHECK (tip IN ('Naked','Sport','Touring','Chopper','Scooter','Enduro','Motocross','Adventure','Cafe Racer','Diğer')),
  sanziman VARCHAR(30),
  sogutma VARCHAR(20),       -- Hava/Su/Yağ
  hasar_kaydi BOOLEAN DEFAULT false,
  garantili BOOLEAN DEFAULT false,
  kimden VARCHAR(20)
);

-- ARAZİ & SUV (otomobil tablosunu extend eder, ek özellikler)
CREATE TABLE IF NOT EXISTS suv_ozellikleri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  yukseklik_ayarli BOOLEAN DEFAULT false,
  off_road_modu BOOLEAN DEFAULT false,
  diff_kilidi BOOLEAN DEFAULT false,
  cekme_kancasi BOOLEAN DEFAULT false,
  hill_descent BOOLEAN DEFAULT false,
  yuzme_derinligi INTEGER    -- mm
);

-- KAMYON & TİCARİ ARAÇ
CREATE TABLE IF NOT EXISTS ticari_arac (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  marka VARCHAR(50),
  model VARCHAR(100),
  yil INTEGER,
  kilometre INTEGER,
  tip VARCHAR(30) CHECK (tip IN ('Kamyon','Kamyonet','Minibüs','Midibüs','Otobüs','Panelvan','Frigorifik','Beton Mikseri','Vinç','Diğer')),
  yakit_tipi VARCHAR(20),
  sanziman VARCHAR(20),
  motor_gucu INTEGER,
  cekme_kapasitesi INTEGER,  -- kg
  yuk_kapasitesi INTEGER,    -- kg
  dorse_dahil BOOLEAN DEFAULT false,
  hasar_kaydi BOOLEAN DEFAULT false,
  muayene_tarihi DATE
);

-- ==========================================
-- 🏠 EMLAK KATEGORİLERİ
-- ==========================================

-- KONUT (Daire, Villa, Müstakil Ev vs)
CREATE TABLE IF NOT EXISTS konut (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,

  -- Temel
  ilan_tipi VARCHAR(20)      CHECK (ilan_tipi IN ('Satılık','Kiralık','Devren Satılık','Devren Kiralık')),
  konut_tipi VARCHAR(30)     CHECK (konut_tipi IN ('Daire','Villa','Müstakil Ev','Yarı Müstakil','Çiftlik Evi','Yazlık','Prefabrik','Köy Evi','Konut')),
  
  -- Boyut
  net_m2 INTEGER,
  brut_m2 INTEGER,
  arsa_m2 INTEGER,           -- Villa/müstakil için
  oda_sayisi VARCHAR(10),    -- 1+1, 2+1, 3.5+1 vs
  salon_sayisi INTEGER DEFAULT 1,
  banyo_sayisi INTEGER DEFAULT 1,
  tuvalet_sayisi INTEGER DEFAULT 1,
  balkon_sayisi INTEGER DEFAULT 0,
  
  -- Konum
  kat INTEGER,
  toplam_kat INTEGER,
  site_adi VARCHAR(100),
  
  -- Isıtma & Yapı
  isitma_tipi VARCHAR(30)    CHECK (isitma_tipi IN ('Doğalgaz (Kombi)','Doğalgaz (Merkezi)','Elektrik','Yerden Isıtma','Klima','Güneş Enerjisi','Soba','Kat Kaloriferi','Diğer')),
  yapi_tipi VARCHAR(20)      CHECK (yapi_tipi IN ('Betonarme','Yığma','Çelik','Ahşap','Prefabrik','Diğer')),
  bina_yasi INTEGER,
  
  -- Özellikler
  esyali BOOLEAN DEFAULT false,
  beyaz_esya BOOLEAN DEFAULT false,
  klima BOOLEAN DEFAULT false,
  asansor BOOLEAN DEFAULT false,
  engelli_giris BOOLEAN DEFAULT false,
  guvenlik BOOLEAN DEFAULT false,
  kamerali_guvenlik BOOLEAN DEFAULT false,
  kapici BOOLEAN DEFAULT false,
  
  -- Otopark
  otopark BOOLEAN DEFAULT false,
  otopark_tipi VARCHAR(20),  -- Açık/Kapalı/Yeraltı
  
  -- Sosyal
  havuz BOOLEAN DEFAULT false,
  spor_salonu BOOLEAN DEFAULT false,
  cocuk_parki BOOLEAN DEFAULT false,
  tenis_kortu BOOLEAN DEFAULT false,
  sauna BOOLEAN DEFAULT false,
  site_icinde BOOLEAN DEFAULT false,
  
  -- Manzara
  deniz_manzarasi BOOLEAN DEFAULT false,
  sehir_manzarasi BOOLEAN DEFAULT false,
  doga_manzarasi BOOLEAN DEFAULT false,
  
  -- Cephe & Kat
  cephe VARCHAR(50),         -- Kuzey/Güney/Doğu/Batı
  giris_kati BOOLEAN DEFAULT false,
  zemin_kati BOOLEAN DEFAULT false,
  
  -- Hukuki
  tapu_tipi VARCHAR(30),     -- Kat Mülkiyeti/İrtifakı/Hisseli
  tapu_durumu VARCHAR(30),
  iskan_var BOOLEAN DEFAULT true,
  krediye_uygun BOOLEAN DEFAULT true,
  
  -- Kira için
  depozito INTEGER,          -- aylık kira adeti
  aidat INTEGER,             -- aylık TL
  kira_garanti BOOLEAN DEFAULT false
);

-- İŞYERİ & OFİS
CREATE TABLE IF NOT EXISTS isyeri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  
  ilan_tipi VARCHAR(20)      CHECK (ilan_tipi IN ('Satılık','Kiralık','Devren Satılık','Devren Kiralık')),
  isyeri_tipi VARCHAR(30)    CHECK (isyeri_tipi IN ('Ofis','Dükkan','Depo','Fabrika','Atölye','Bufe','Akaryakıt İstasyonu','Otel','Apart Otel','Diğer')),
  
  net_m2 INTEGER,
  brut_m2 INTEGER,
  kat INTEGER,
  toplam_kat INTEGER,
  
  isitma_tipi VARCHAR(30),
  klima BOOLEAN DEFAULT false,
  asansor BOOLEAN DEFAULT false,
  otopark BOOLEAN DEFAULT false,
  depo_var BOOLEAN DEFAULT false,
  depo_m2 INTEGER,
  
  tapu_tipi VARCHAR(30),
  kira_getirisi DECIMAL(10,2),
  isyeri_ruhsati BOOLEAN DEFAULT false,
  
  -- Devren için
  devren_sebep TEXT,
  aylik_ciro DECIMAL(12,2),
  aylik_kira DECIMAL(12,2),
  personel_sayisi INTEGER,
  sozlesme_suresi INTEGER    -- ay
);

-- ARSA & ARAZİ
CREATE TABLE IF NOT EXISTS arsa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  
  arsa_tipi VARCHAR(20)      CHECK (arsa_tipi IN ('Arsa','Tarla','Bahçe','Zeytinlik','Bağ','Orman','Mera','Göl','Diğer')),
  m2 INTEGER,
  
  -- İmar
  imar_durumu VARCHAR(30)    CHECK (imar_durumu IN ('İmarlı','İmarsız','Köy İçi','Tarım','Sanayi','Turizm','Orman')),
  emsal DECIMAL(5,2),        -- kat sayısı katsayısı
  kaks DECIMAL(5,2),
  gabari INTEGER,            -- maksimum kat
  ifraz BOOLEAN DEFAULT false,
  
  tapu_tipi VARCHAR(30),
  ada_parsel VARCHAR(50),
  pafta VARCHAR(50)
);

-- ==========================================
-- 📱 ELEKTRONİK KATEGORİLERİ
-- ==========================================

-- CEP TELEFONU
CREATE TABLE IF NOT EXISTS cep_telefonu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  marka VARCHAR(50),         -- Apple, Samsung, Xiaomi vs
  model VARCHAR(100),
  depolama VARCHAR(20),      -- 64GB, 128GB, 256GB vs
  ram VARCHAR(20),
  renk VARCHAR(30),
  durum VARCHAR(20)          CHECK (durum IN ('Sıfır','Açılmamış Kutu','Az Kullanılmış','İyi','Normal','Hasarlı')),
  isletim_sistemi VARCHAR(10) CHECK (isletim_sistemi IN ('iOS','Android','Diğer')),
  garanti BOOLEAN DEFAULT false,
  garanti_bitis DATE,
  kutu_var BOOLEAN DEFAULT false,
  sarj_aleti BOOLEAN DEFAULT false,
  ekran_inch DECIMAL(4,1),
  kamera_mp INTEGER,
  pil_kapasitesi INTEGER,    -- mAh
  5g BOOLEAN DEFAULT false,
  operatorsuz BOOLEAN DEFAULT true,
  imei_temiz BOOLEAN DEFAULT true
);

-- BİLGİSAYAR
CREATE TABLE IF NOT EXISTS bilgisayar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  tip VARCHAR(20)            CHECK (tip IN ('Laptop','Masaüstü','All-in-One','Mini PC','Tablet','İkisi Birden')),
  marka VARCHAR(50),
  model VARCHAR(100),
  islemci VARCHAR(100),      -- i7-12700H, M3 Pro vs
  ram VARCHAR(20),           -- 16GB DDR5
  depolama VARCHAR(50),      -- 512GB SSD + 1TB HDD
  ekran_karti VARCHAR(100),
  ekran_inch DECIMAL(4,1),
  ekran_cozunurluk VARCHAR(20),
  isletim_sistemi VARCHAR(30),
  durum VARCHAR(20),
  garanti BOOLEAN DEFAULT false,
  pil_sagligi INTEGER,       -- yüzde
  klavye_aydinlatma BOOLEAN DEFAULT false,
  dokunmatik_ekran BOOLEAN DEFAULT false,
  parmak_izi BOOLEAN DEFAULT false
);

-- TV & GÖRÜNTÜ
CREATE TABLE IF NOT EXISTS tv (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  marka VARCHAR(50),
  model VARCHAR(100),
  ekran_inch INTEGER,
  panel_tipi VARCHAR(20)     CHECK (panel_tipi IN ('LED','OLED','QLED','Mini LED','AMOLED','NanoCell','Diğer')),
  cozunurluk VARCHAR(20)     CHECK (cozunurluk IN ('4K UHD','8K','Full HD','HD Ready','HD')),
  smart_tv BOOLEAN DEFAULT true,
  isletim_sistemi VARCHAR(30),
  yenileme_hizi INTEGER,     -- Hz
  hdr BOOLEAN DEFAULT false,
  dolby_vision BOOLEAN DEFAULT false,
  ses_watt INTEGER,
  hdmi_sayisi INTEGER,
  usb_sayisi INTEGER,
  durum VARCHAR(20),
  uretim_yili INTEGER
);

-- OYUN KONSOLİ
CREATE TABLE IF NOT EXISTS oyun_konsolu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  marka VARCHAR(30)          CHECK (marka IN ('PlayStation','Xbox','Nintendo','PC','Diğer')),
  model VARCHAR(50),
  depolama VARCHAR(20),
  kontrolcu_sayisi INTEGER,
  oyun_sayisi INTEGER,
  durum VARCHAR(20),
  garanti BOOLEAN DEFAULT false
);

-- ==========================================
-- 🛋️ EV & YAŞAM
-- ==========================================

CREATE TABLE IF NOT EXISTS ev_esya (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  kategori VARCHAR(50)       CHECK (kategori IN ('Koltuk & Kanepe','Yatak & Yatak Odası','Masa & Sandalye','Dolap & Gardırop','Mutfak','Banyo','Aydınlatma','Halı & Perde','Diğer')),
  marka VARCHAR(50),
  durum VARCHAR(20)          CHECK (durum IN ('Sıfır','Az Kullanılmış','İyi','Normal','Hasarlı')),
  malzeme VARCHAR(50),
  renk VARCHAR(30),
  boyutlar VARCHAR(100),     -- En x Boy x Yükseklik cm
  garanti BOOLEAN DEFAULT false
);

-- ==========================================
-- 👗 GİYİM & AKSESUAR
-- ==========================================

CREATE TABLE IF NOT EXISTS giyim (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  kategori VARCHAR(50)       CHECK (kategori IN ('Üst Giyim','Alt Giyim','Dış Giyim','Spor Giyim','İç Giyim','Ayakkabı','Çanta','Aksesuar','Takı & Mücevher','Saat','Diğer')),
  marka VARCHAR(50),
  beden VARCHAR(20),
  renk VARCHAR(30),
  cinsiyet VARCHAR(10)       CHECK (cinsiyet IN ('Kadın','Erkek','Unisex','Çocuk')),
  durum VARCHAR(20)          CHECK (durum IN ('Sıfır Etiketli','Sıfır Etiketsiz','Az Kullanılmış','İyi','Normal')),
  malzeme VARCHAR(50),
  sezon VARCHAR(20),
  orijinal BOOLEAN DEFAULT true
);

-- ==========================================
-- ⚽ SPOR & OUTDOOR
-- ==========================================

CREATE TABLE IF NOT EXISTS spor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  kategori VARCHAR(50)       CHECK (kategori IN ('Bisiklet','Fitness Aleti','Kamp & Outdoor','Su Sporları','Kış Sporları','Takım Sporu Malzemeleri','Diğer')),
  marka VARCHAR(50),
  model VARCHAR(100),
  durum VARCHAR(20),
  garanti BOOLEAN DEFAULT false,
  orijinal BOOLEAN DEFAULT true
);

-- ==========================================
-- 🌾 TARIM & HAYVANCILIK
-- ==========================================

CREATE TABLE IF NOT EXISTS tarim (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  kategori VARCHAR(30)       CHECK (kategori IN ('Traktör','Biçerdöver','Römork','Sulama Sistemi','Tarım İlacı','Tohum','Gübre','Hayvan','Diğer')),
  marka VARCHAR(50),
  model VARCHAR(100),
  yil INTEGER,
  durum VARCHAR(20),
  hayvan_cinsi VARCHAR(50),  -- Hayvan ilanı için
  hayvan_irki VARCHAR(50),
  hayvan_yasi INTEGER,
  adet INTEGER DEFAULT 1
);

-- ==========================================
-- 🏗️ İŞ MAKİNELERİ
-- ==========================================

CREATE TABLE IF NOT EXISTS is_makinesi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  tip VARCHAR(30)            CHECK (tip IN ('Ekskavatör','Dozer','Forklift','Yükleyici','Greyder','Sondaj','Vinç','Kompresör','Jeneratör','Diğer')),
  marka VARCHAR(50),
  model VARCHAR(100),
  yil INTEGER,
  calisma_saati INTEGER,
  durum VARCHAR(20),
  garantili BOOLEAN DEFAULT false
);

-- ==========================================
-- 👶 ANNE & ÇOCUK
-- ==========================================

CREATE TABLE IF NOT EXISTS anne_cocuk (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  kategori VARCHAR(40)       CHECK (kategori IN ('Bebek Arabası','Araba Koltuğu','Beslenme','Oyuncak','Giyim','Mobilya','Okul Malzemeleri','Diğer')),
  marka VARCHAR(50),
  yas_araligi VARCHAR(20),   -- 0-3 ay, 6-12 ay vs
  durum VARCHAR(20),
  guvenlik_sertifikasi BOOLEAN DEFAULT false
);

-- ==========================================
-- 🐾 HAYVANLAR
-- ==========================================

CREATE TABLE IF NOT EXISTS hayvan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  hayvan_turu VARCHAR(20)    CHECK (hayvan_turu IN ('Köpek','Kedi','Kuş','Balık','Sürüngen','Kemirgen','Diğer')),
  irk VARCHAR(50),
  yas INTEGER,               -- ay cinsinden
  cinsiyet VARCHAR(10)       CHECK (cinsiyet IN ('Erkek','Dişi','Belirsiz')),
  renk VARCHAR(50),
  asi_durumu BOOLEAN DEFAULT false,
  kisilastirildi BOOLEAN DEFAULT false,
  pedigree BOOLEAN DEFAULT false,
  ucretsiz BOOLEAN DEFAULT false,
  sahiplendirilecek BOOLEAN DEFAULT false
);

-- ==========================================
-- ⛵ YAT & TEKNE
-- ==========================================

CREATE TABLE IF NOT EXISTS tekne (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE UNIQUE,
  tip VARCHAR(20)            CHECK (tip IN ('Motor Tekne','Yelkenli','Sürat Teknesi','Bot','Yat','Katamaran','Diğer')),
  marka VARCHAR(50),
  model VARCHAR(100),
  yil INTEGER,
  uzunluk DECIMAL(6,2),      -- metre
  malzeme VARCHAR(20),       -- Fiber/Ahşap/Alüminyum/Çelik
  motor_marka VARCHAR(30),
  motor_gucu INTEGER,        -- HP/BG
  motor_saati INTEGER,
  denize_hazir BOOLEAN DEFAULT false,
  belge_var BOOLEAN DEFAULT false
);

-- ==========================================
-- 📦 GENEL ÜRÜN ÖZELLİKLERİ
-- ==========================================

-- İlan özelliklerine dinamik etiket sistemi
CREATE TABLE IF NOT EXISTS ilan_etiketler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE CASCADE,
  anahtar VARCHAR(100) NOT NULL,  -- 'sunroof', 'garantili' vs
  deger VARCHAR(200),             -- 'true', 'Evet', 'Harman Kardon' vs
  olusturuldu TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_etiketler_ilan ON ilan_etiketler(ilan_id);

-- ==========================================
-- 🔄 GÜNCEL MARKA LİSTELERİ
-- ==========================================

CREATE TABLE IF NOT EXISTS arac_markalar (
  id SERIAL PRIMARY KEY,
  marka VARCHAR(50) NOT NULL UNIQUE,
  logo_url VARCHAR(200),
  aktif BOOLEAN DEFAULT true
);

INSERT INTO arac_markalar (marka) VALUES
  ('Alfa Romeo'),('Aston Martin'),('Audi'),('BMW'),('Bentley'),
  ('Citroen'),('Dacia'),('Fiat'),('Ford'),('Honda'),
  ('Hyundai'),('Infiniti'),('Jaguar'),('Jeep'),('Kia'),
  ('Lamborghini'),('Land Rover'),('Lexus'),('Lincoln'),('Maserati'),
  ('Mazda'),('McLaren'),('Mercedes-Benz'),('Mini'),('Mitsubishi'),
  ('Nissan'),('Opel'),('Peugeot'),('Porsche'),('Renault'),
  ('Rolls-Royce'),('Seat'),('Skoda'),('Smart'),('Subaru'),
  ('Suzuki'),('Toyota'),('Volkswagen'),('Volvo'),('Tesla'),
  ('BYD'),('Chery'),('Geely'),('MG'),('Togg')
ON CONFLICT (marka) DO NOTHING;

-- Türkiye ilçeleri (örnek - tam liste eklenebilir)
INSERT INTO ilceler (sehir_id, ad) VALUES
  -- İstanbul (1)
  (1,'Adalar'),(1,'Arnavutköy'),(1,'Ataşehir'),(1,'Avcılar'),
  (1,'Bağcılar'),(1,'Bahçelievler'),(1,'Bakırköy'),(1,'Başakşehir'),
  (1,'Bayrampaşa'),(1,'Beşiktaş'),(1,'Beykoz'),(1,'Beylikdüzü'),
  (1,'Beyoğlu'),(1,'Büyükçekmece'),(1,'Çatalca'),(1,'Çekmeköy'),
  (1,'Esenler'),(1,'Esenyurt'),(1,'Eyüpsultan'),(1,'Fatih'),
  (1,'Gaziosmanpaşa'),(1,'Güngören'),(1,'Kadıköy'),(1,'Kağıthane'),
  (1,'Kartal'),(1,'Küçükçekmece'),(1,'Maltepe'),(1,'Pendik'),
  (1,'Sancaktepe'),(1,'Sarıyer'),(1,'Şile'),(1,'Silivri'),
  (1,'Şişli'),(1,'Sultanbeyli'),(1,'Sultangazi'),(1,'Tuzla'),
  (1,'Ümraniye'),(1,'Üsküdar'),(1,'Zeytinburnu'),
  -- Ankara (2)
  (2,'Altındağ'),(2,'Ayaş'),(2,'Bala'),(2,'Beypazarı'),
  (2,'Çamlıdere'),(2,'Çankaya'),(2,'Çubuk'),(2,'Elmadağ'),
  (2,'Etimesgut'),(2,'Evren'),(2,'Gölbaşı'),(2,'Güdül'),
  (2,'Haymana'),(2,'Kahramankazan'),(2,'Kalecik'),(2,'Keçiören'),
  (2,'Kızılcahamam'),(2,'Mamak'),(2,'Nallıhan'),(2,'Polatlı'),
  (2,'Pursaklar'),(2,'Sincan'),(2,'Şereflikoçhisar'),(2,'Yenimahalle'),
  -- İzmir (3)
  (3,'Aliağa'),(3,'Balçova'),(3,'Bayındır'),(3,'Bayraklı'),
  (3,'Bergama'),(3,'Beydağ'),(3,'Bornova'),(3,'Buca'),
  (3,'Çeşme'),(3,'Çiğli'),(3,'Dikili'),(3,'Foça'),
  (3,'Gaziemir'),(3,'Güzelbahçe'),(3,'Karabağlar'),(3,'Karaburun'),
  (3,'Karşıyaka'),(3,'Kemalpaşa'),(3,'Kınık'),(3,'Kiraz'),
  (3,'Konak'),(3,'Menderes'),(3,'Menemen'),(3,'Narlıdere'),
  (3,'Ödemiş'),(3,'Seferihisar'),(3,'Selçuk'),(3,'Tire'),
  (3,'Torbalı'),(3,'Urla'),
  -- Adana (4)
  (4,'Aladağ'),(4,'Ceyhan'),(4,'Çukurova'),(4,'Feke'),
  (4,'İmamoğlu'),(4,'Karaisalı'),(4,'Karataş'),(4,'Kozan'),
  (4,'Pozantı'),(4,'Saimbeyli'),(4,'Sarıçam'),(4,'Seyhan'),
  (4,'Tufanbeyli'),(4,'Yumurtalık'),(4,'Yüreğir')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE otomobil IS 'Otomobil ilanları için detaylı özellikler';
COMMENT ON TABLE konut IS 'Konut ilanları için detaylı özellikler';
COMMENT ON TABLE isyeri IS 'İşyeri ilanları için detaylı özellikler';
COMMENT ON TABLE arsa IS 'Arsa/tarla ilanları için detaylı özellikler';
COMMENT ON TABLE cep_telefonu IS 'Cep telefonu ilanları için detaylı özellikler';
COMMENT ON TABLE bilgisayar IS 'Bilgisayar ilanları için detaylı özellikler';
