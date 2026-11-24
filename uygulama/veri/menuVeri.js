const { okumaHavuzu, yazmaHavuzu } = require("./baglanti");

async function gunMenusunuGetir(yemekhaneId, ogunId, tarih) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT menu_id, tarih, yemekhane_id, yemekhane, ogun_id, ogun,
            rezervasyon_son, ogrenci_fiyati, personel_fiyati,
            yemek_id, yemek, kategori_id, kategori, kategori_sira,
            kalori, vejetaryen, alerjenler, alerjen_idler
     FROM v_menu_detay
     WHERE yemekhane_id = ? AND ogun_id = ? AND tarih = ?
     ORDER BY kategori_sira, yemek`,
    [yemekhaneId, ogunId, tarih]
  );
  return satirlar;
}

async function haftalikMenuGetir(yemekhaneId, baslangicTarih, bitisTarih) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT md.menu_id, md.tarih, md.yemekhane_id, md.yemekhane,
            md.ogun_id, md.ogun, md.ogun_sira, md.rezervasyon_son,
            md.ogrenci_fiyati, md.personel_fiyati,
            vd.bos_yer, vd.rezerve, vd.doluluk_yuzde
     FROM v_menu_detay md
     JOIN v_menu_doluluk vd ON vd.menu_id = md.menu_id
     WHERE md.yemekhane_id = ? AND md.tarih BETWEEN ? AND ?
     GROUP BY md.menu_id, md.tarih, md.yemekhane_id, md.yemekhane,
              md.ogun_id, md.ogun, md.ogun_sira, md.rezervasyon_son,
              md.ogrenci_fiyati, md.personel_fiyati,
              vd.bos_yer, vd.rezerve, vd.doluluk_yuzde
     ORDER BY md.tarih, md.ogun_sira`,
    [yemekhaneId, baslangicTarih, bitisTarih]
  );
  return satirlar;
}

async function menuDetayGetir(menuId) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT menu_id, tarih, yemekhane_id, yemekhane, ogun_id, ogun,
            rezervasyon_son, ogrenci_fiyati, personel_fiyati,
            yemek_id, yemek, kategori_id, kategori, kategori_sira,
            kalori, vejetaryen, alerjenler, alerjen_idler
     FROM v_menu_detay
     WHERE menu_id = ?
     ORDER BY kategori_sira, yemek`,
    [menuId]
  );
  return satirlar;
}

async function menuOlustur(yemekhaneId, tarih, ogunId, ogrenciFiyati, personelFiyati) {
  const baglanti = await yazmaHavuzu.getConnection();
  try {
    const [sonuc] = await baglanti.execute(
      `INSERT INTO menuler (yemekhane_id, tarih, ogun_id, ogrenci_fiyati, personel_fiyati)
       VALUES (?, ?, ?, ?, ?)`,
      [yemekhaneId, tarih, ogunId, ogrenciFiyati, personelFiyati]
    );
    return sonuc.insertId;
  } finally {
    baglanti.release();
  }
}

async function menuYemekEkle(menuId, yemekIdleri) {
  const baglanti = await yazmaHavuzu.getConnection();
  try {
    await baglanti.execute("DELETE FROM menu_yemekleri WHERE menu_id = ?", [menuId]);
    for (const yemekId of yemekIdleri) {
      await baglanti.execute(
        "INSERT INTO menu_yemekleri (menu_id, yemek_id) VALUES (?, ?)",
        [menuId, yemekId]
      );
    }
  } finally {
    baglanti.release();
  }
}

async function yoneticiMenuListesi(yemekhaneId) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT vd.menu_id, vd.tarih, vd.yemekhane, vd.ogun, vd.bos_yer, vd.rezerve,
            vd.kapasite, vd.doluluk_yuzde, vd.rezervasyon_son,
            vp.oy_sayisi, vp.ortalama_puan,
            m.ogrenci_fiyati, m.personel_fiyati
     FROM v_menu_doluluk vd
     JOIN v_menu_puan vp ON vp.menu_id = vd.menu_id
     JOIN menuler m ON m.id = vd.menu_id
     WHERE vd.yemekhane_id = ?
     ORDER BY vd.tarih DESC, vd.ogun_id`,
    [yemekhaneId]
  );
  return satirlar;
}

async function yemekleriGetir() {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT y.id, y.ad, y.kalori, y.vejetaryen, k.ad AS kategori, k.sira AS kategori_sira
     FROM yemekler y
     JOIN yemek_kategorileri k ON k.id = y.kategori_id
     ORDER BY k.sira, y.ad`
  );
  return satirlar;
}

module.exports = {
  gunMenusunuGetir,
  haftalikMenuGetir,
  menuDetayGetir,
  menuOlustur,
  menuYemekEkle,
  yoneticiMenuListesi,
  yemekleriGetir
};
