const { okumaHavuzu, yazmaHavuzu } = require("./baglanti");

async function degerlendirmeEkle(kullaniciId, menuId, puan, yorum) {
  const baglanti = await yazmaHavuzu.getConnection();
  try {
    await baglanti.execute(
      `INSERT INTO degerlendirmeler (kullanici_id, menu_id, puan, yorum)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE puan = VALUES(puan), yorum = VALUES(yorum)`,
      [kullaniciId, menuId, puan, yorum || null]
    );
  } finally {
    baglanti.release();
  }
}

async function kullaniciDegerlendirmeleriGetir(kullaniciId) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT d.id, d.menu_id, d.puan, d.yorum, d.olusturma,
            m.tarih, o.ad AS ogun, yh.ad AS yemekhane
     FROM degerlendirmeler d
     JOIN menuler m ON m.id = d.menu_id
     JOIN ogunler o ON o.id = m.ogun_id
     JOIN yemekhaneler yh ON yh.id = m.yemekhane_id
     WHERE d.kullanici_id = ?
     ORDER BY d.olusturma DESC`,
    [kullaniciId]
  );
  return satirlar;
}

async function kullanilmisMenuleriGetir(kullaniciId) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT r.menu_id, m.tarih, o.ad AS ogun, yh.ad AS yemekhane,
            d.puan AS mevcut_puan, d.yorum AS mevcut_yorum
     FROM rezervasyonlar r
     JOIN menuler m ON m.id = r.menu_id
     JOIN ogunler o ON o.id = m.ogun_id
     JOIN yemekhaneler yh ON yh.id = m.yemekhane_id
     LEFT JOIN degerlendirmeler d ON d.kullanici_id = r.kullanici_id AND d.menu_id = r.menu_id
     WHERE r.kullanici_id = ? AND r.durum = 'kullanildi'
     ORDER BY m.tarih DESC`,
    [kullaniciId]
  );
  return satirlar;
}

module.exports = {
  degerlendirmeEkle,
  kullaniciDegerlendirmeleriGetir,
  kullanilmisMenuleriGetir
};
