const { okumaHavuzu, yazmaHavuzu } = require("./baglanti");

async function rezervasyonYap(kullaniciId, menuId, porsiyon) {
  const [sonuc] = await yazmaHavuzu.execute(
    "CALL sp_rezervasyon_yap(?, ?, ?)",
    [kullaniciId, menuId, porsiyon]
  );

  return sonuc[0][0];
}

async function rezervasyonIptal(kullaniciId, rezervasyonId) {
  const [sonuc] = await yazmaHavuzu.execute(
    "CALL sp_rezervasyon_iptal(?, ?)",
    [kullaniciId, rezervasyonId]
  );

  return sonuc[0][0];
}

async function kullaniciRezervasyonlariGetir(kullaniciId) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT
       r.id,
       r.menu_id,
       r.durum,
       r.ucret,
       r.porsiyon,
       m.tarih,
       yh.ad AS yemekhane,
       o.ad AS ogun,
       TIMESTAMP(m.tarih, o.son_saat) AS rezervasyon_son
     FROM rezervasyonlar r
     JOIN menuler m ON m.id = r.menu_id
     JOIN yemekhaneler yh ON yh.id = m.yemekhane_id
     JOIN ogunler o ON o.id = m.ogun_id
     WHERE r.kullanici_id = ?
     ORDER BY m.tarih DESC, o.sira`,
    [kullaniciId]
  );

  return satirlar;
}

async function kullanildiBirRezervasyonVarMi(kullaniciId, menuId) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT id
     FROM rezervasyonlar
     WHERE kullanici_id = ?
       AND menu_id = ?
       AND durum = 'kullanildi'
     LIMIT 1`,
    [kullaniciId, menuId]
  );

  return satirlar.length > 0;
}

module.exports = {
  rezervasyonYap,
  rezervasyonIptal,
  kullaniciRezervasyonlariGetir,
  kullanildiBirRezervasyonVarMi
};