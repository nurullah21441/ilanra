const db = require('../config/db');

// Kategori tablosu map'i
const KATEGORI_TABLO = {
  'otomobil': 'otomobil',
  'suv': 'otomobil',       // SUV de otomobil tablosunu kullanır
  'motosiklet': 'motosiklet',
  'kamyon': 'ticari_arac',
  'daire': 'konut',
  'villa': 'konut',
  'mustakil': 'konut',
  'yazlik': 'konut',
  'isyeri': 'isyeri',
  'dukkan': 'isyeri',
  'ofis': 'isyeri',
  'arsa': 'arsa',
  'tarla': 'arsa',
  'cep-telefonu': 'cep_telefonu',
  'bilgisayar': 'bilgisayar',
  'tv': 'tv',
  'oyun-konsolu': 'oyun_konsolu',
  'giyim': 'giyim',
  'spor': 'spor',
  'tarim': 'tarim',
  'is-makinesi': 'is_makinesi',
  'anne-cocuk': 'anne_cocuk',
  'hayvan': 'hayvan',
  'tekne': 'tekne',
  'mobilya': 'ev_esya'
};

// Otomobil özellikleri kaydet/güncelle
const otomobilKaydet = async (req, res) => {
  try {
    const { ilan_id } = req.params;
    const ozellikler = req.body;

    // İlan sahibi kontrolü
    const ilan = await db.query(
      'SELECT kullanici_id FROM ilanlar WHERE id = $1',
      [ilan_id]
    );
    if (!ilan.rows[0] || ilan.rows[0].kullanici_id !== req.kullanici.id) {
      return res.status(403).json({ hata: 'Yetki yok' });
    }

    const {
      marka, seri, model, yil, kilometre, renk, renk_orijinal,
      motor_hacmi, motor_gucu, yakit_tipi, sanziman, cekis,
      vites_sayisi, silindir_sayisi, kasa_tipi, kapi_sayisi, koltuk_sayisi,
      kimden, hasar_kaydi, hasar_detay, boya_degisen, tramer_kaydi,
      garantili, garanti_bitis, muayene_tarihi,
      // Güvenlik
      hava_yastigi, abs, esp, traction_control, kor_nokta_uyari,
      serit_takip, geri_gorus_kamera, kamera_360, park_sensoru_on,
      park_sensoru_arka, park_asistani, otomatik_fren,
      // Konfor
      klima, isitmali_on_koltuk, isitmali_arka_koltuk, sogutmali_koltuk,
      masajli_koltuk, hafiza_koltuk, elektrikli_koltuk, isitmali_direksiyon,
      sunroof, panoramik_tavan, hud, dijital_gosterge, keyless_entry,
      // Multimedya
      dokunmatik_ekran, ekran_inch, navigasyon, apple_carplay, android_auto,
      kablosuz_sarj, bluetooth, usb_port, ses_sistemi, hoparlor_sayisi,
      // Dış
      led_far, lazer_far, adaptif_far, jant_tipi, jant_inchi,
      takas, takas_detay, kredi_uygun
    } = ozellikler;

    // UPSERT (var ise güncelle, yoksa ekle)
    await db.query(`
      INSERT INTO otomobil (
        ilan_id, marka, seri, model, yil, kilometre, renk, renk_orijinal,
        motor_hacmi, motor_gucu, yakit_tipi, sanziman, cekis, vites_sayisi,
        silindir_sayisi, kasa_tipi, kapi_sayisi, koltuk_sayisi,
        kimden, hasar_kaydi, hasar_detay, boya_degisen, tramer_kaydi,
        garantili, garanti_bitis, muayene_tarihi,
        hava_yastigi, abs, esp, traction_control, kor_nokta_uyari,
        serit_takip, geri_gorus_kamera, kamera_360, park_sensoru_on,
        park_sensoru_arka, park_asistani, otomatik_fren,
        klima, isitmali_on_koltuk, isitmali_arka_koltuk, sogutmali_koltuk,
        masajli_koltuk, hafiza_koltuk, elektrikli_koltuk, isitmali_direksiyon,
        sunroof, panoramik_tavan, hud, dijital_gosterge, keyless_entry,
        dokunmatik_ekran, ekran_inch, navigasyon, apple_carplay, android_auto,
        kablosuz_sarj, bluetooth, usb_port, ses_sistemi, hoparlor_sayisi,
        led_far, lazer_far, adaptif_far, jant_tipi, jant_inchi,
        takas, takas_detay, kredi_uygun
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,
        $35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,
        $51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63,$64,$65,$66,$67
      )
      ON CONFLICT (ilan_id) DO UPDATE SET
        marka=$2, seri=$3, model=$4, yil=$5, kilometre=$6, renk=$7,
        motor_hacmi=$9, motor_gucu=$10, yakit_tipi=$11, sanziman=$12,
        hasar_kaydi=$20, garantili=$24, sunroof=$47, hud=$49,
        apple_carplay=$54, android_auto=$55, led_far=$61, takas=$65
    `, [
      ilan_id, marka, seri, model, yil, kilometre, renk, renk_orijinal ?? true,
      motor_hacmi, motor_gucu, yakit_tipi, sanziman, cekis, vites_sayisi,
      silindir_sayisi, kasa_tipi, kapi_sayisi, koltuk_sayisi,
      kimden ?? 'Sahibinden', hasar_kaydi ?? false, hasar_detay, boya_degisen,
      tramer_kaydi ?? false, garantili ?? false, garanti_bitis, muayene_tarihi,
      hava_yastigi, abs ?? false, esp ?? false, traction_control ?? false,
      kor_nokta_uyari ?? false, serit_takip ?? false, geri_gorus_kamera ?? false,
      kamera_360 ?? false, park_sensoru_on ?? false, park_sensoru_arka ?? false,
      park_asistani ?? false, otomatik_fren ?? false,
      klima, isitmali_on_koltuk ?? false, isitmali_arka_koltuk ?? false,
      sogutmali_koltuk ?? false, masajli_koltuk ?? false, hafiza_koltuk ?? false,
      elektrikli_koltuk ?? false, isitmali_direksiyon ?? false,
      sunroof ?? false, panoramik_tavan ?? false, hud ?? false,
      dijital_gosterge ?? false, keyless_entry ?? false,
      dokunmatik_ekran ?? false, ekran_inch, navigasyon ?? false,
      apple_carplay ?? false, android_auto ?? false, kablosuz_sarj ?? false,
      bluetooth ?? false, usb_port ?? 0, ses_sistemi, hoparlor_sayisi,
      led_far ?? false, lazer_far ?? false, adaptif_far ?? false,
      jant_tipi, jant_inchi, takas ?? false, takas_detay, kredi_uygun ?? true
    ]);

    res.json({ mesaj: 'Araç özellikleri kaydedildi' });
  } catch (err) {
    console.error('Otomobil özellikleri hatası:', err);
    res.status(500).json({ hata: 'Özellikler kaydedilemedi', detay: err.message });
  }
};

// Konut özellikleri kaydet
const konutKaydet = async (req, res) => {
  try {
    const { ilan_id } = req.params;
    const oz = req.body;

    await db.query(`
      INSERT INTO konut (
        ilan_id, ilan_tipi, konut_tipi, net_m2, brut_m2, arsa_m2,
        oda_sayisi, salon_sayisi, banyo_sayisi, tuvalet_sayisi, balkon_sayisi,
        kat, toplam_kat, site_adi, isitma_tipi, yapi_tipi, bina_yasi,
        esyali, beyaz_esya, klima, asansor, engelli_giris, guvenlik,
        kamerali_guvenlik, kapici, otopark, otopark_tipi,
        havuz, spor_salonu, cocuk_parki, tenis_kortu, sauna, site_icinde,
        deniz_manzarasi, sehir_manzarasi, doga_manzarasi,
        cephe, tapu_tipi, iskan_var, krediye_uygun, depozito, aidat
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
        $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,
        $34,$35,$36,$37,$38,$39,$40,$41,$42
      )
      ON CONFLICT (ilan_id) DO UPDATE SET
        ilan_tipi=$2, konut_tipi=$3, net_m2=$4, oda_sayisi=$7,
        kat=$12, toplam_kat=$13, isitma_tipi=$15, bina_yasi=$17,
        esyali=$18, asansor=$21, otopark=$26, tapu_tipi=$38
    `, [
      ilan_id, oz.ilan_tipi, oz.konut_tipi, oz.net_m2, oz.brut_m2, oz.arsa_m2,
      oz.oda_sayisi, oz.salon_sayisi ?? 1, oz.banyo_sayisi ?? 1,
      oz.tuvalet_sayisi ?? 1, oz.balkon_sayisi ?? 0,
      oz.kat, oz.toplam_kat, oz.site_adi, oz.isitma_tipi, oz.yapi_tipi, oz.bina_yasi,
      oz.esyali ?? false, oz.beyaz_esya ?? false, oz.klima ?? false,
      oz.asansor ?? false, oz.engelli_giris ?? false, oz.guvenlik ?? false,
      oz.kamerali_guvenlik ?? false, oz.kapici ?? false,
      oz.otopark ?? false, oz.otopark_tipi,
      oz.havuz ?? false, oz.spor_salonu ?? false, oz.cocuk_parki ?? false,
      oz.tenis_kortu ?? false, oz.sauna ?? false, oz.site_icinde ?? false,
      oz.deniz_manzarasi ?? false, oz.sehir_manzarasi ?? false, oz.doga_manzarasi ?? false,
      oz.cephe, oz.tapu_tipi, oz.iskan_var ?? true, oz.krediye_uygun ?? true,
      oz.depozito, oz.aidat
    ]);

    res.json({ mesaj: 'Konut özellikleri kaydedildi' });
  } catch (err) {
    console.error('Konut özellikleri hatası:', err);
    res.status(500).json({ hata: 'Özellikler kaydedilemedi' });
  }
};

// Cep telefonu özellikleri
const cepTelefonuKaydet = async (req, res) => {
  try {
    const { ilan_id } = req.params;
    const oz = req.body;

    await db.query(`
      INSERT INTO cep_telefonu (
        ilan_id, marka, model, depolama, ram, renk, durum,
        isletim_sistemi, garanti, garanti_bitis, kutu_var, sarj_aleti,
        ekran_inch, kamera_mp, pil_kapasitesi, operatorsuz, imei_temiz
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      ON CONFLICT (ilan_id) DO UPDATE SET
        marka=$2, model=$3, depolama=$4, durum=$7, garanti=$9
    `, [
      ilan_id, oz.marka, oz.model, oz.depolama, oz.ram, oz.renk,
      oz.durum ?? 'İyi', oz.isletim_sistemi, oz.garanti ?? false,
      oz.garanti_bitis, oz.kutu_var ?? false, oz.sarj_aleti ?? false,
      oz.ekran_inch, oz.kamera_mp, oz.pil_kapasitesi,
      oz.operatorsuz ?? true, oz.imei_temiz ?? true
    ]);

    res.json({ mesaj: 'Telefon özellikleri kaydedildi' });
  } catch (err) {
    res.status(500).json({ hata: 'Özellikler kaydedilemedi' });
  }
};

// Araç markalarını getir
const markalariGetir = async (req, res) => {
  try {
    const result = await db.query('SELECT marka FROM arac_markalar WHERE aktif = true ORDER BY marka');
    res.json({ markalar: result.rows.map(r => r.marka) });
  } catch (err) {
    res.status(500).json({ hata: 'Markalar alınamadı' });
  }
};

// Kategoriye göre özellikleri getir
const ozellikGetir = async (req, res) => {
  try {
    const { ilan_id, kategori } = req.params;
    const tablo = KATEGORI_TABLO[kategori];

    if (!tablo) {
      return res.json({ ozellikler: null });
    }

    const result = await db.query(
      `SELECT * FROM ${tablo} WHERE ilan_id = $1`, [ilan_id]
    );

    res.json({ ozellikler: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ hata: 'Özellikler alınamadı' });
  }
};

// Genel özellik kaydet (dinamik etiket sistemi)
const etiketKaydet = async (req, res) => {
  try {
    const { ilan_id } = req.params;
    const { etiketler } = req.body; // [{anahtar, deger}]

    if (!Array.isArray(etiketler)) {
      return res.status(400).json({ hata: 'Etiketler dizi olmalıdır' });
    }

    // Önce eski etiketleri sil
    await db.query('DELETE FROM ilan_etiketler WHERE ilan_id = $1', [ilan_id]);

    // Yeni etiketleri ekle
    for (const et of etiketler) {
      if (et.anahtar) {
        await db.query(
          'INSERT INTO ilan_etiketler (ilan_id, anahtar, deger) VALUES ($1, $2, $3)',
          [ilan_id, et.anahtar, et.deger || 'true']
        );
      }
    }

    res.json({ mesaj: 'Etiketler kaydedildi' });
  } catch (err) {
    res.status(500).json({ hata: 'Etiketler kaydedilemedi' });
  }
};

module.exports = {
  otomobilKaydet, konutKaydet, cepTelefonuKaydet,
  markalariGetir, ozellikGetir, etiketKaydet
};
