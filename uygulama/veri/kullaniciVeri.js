const { okumaHavuzu, yazmaHavuzu } = require("./baglanti");

async function kullaniciyiEpostaIleGetir(eposta) {
  const [satirlar] = await okumaHavuzu.execute(
    "SELECT id, ad, soyad, eposta, sifre_hash, rol, ogrenci_no, bakiye, aktif FROM kullanicilar WHERE eposta = ? LIMIT 1",
    [eposta]
  );
  return satirlar[0] || null;
}

async function kullaniciyiIdIleGetir(id) {
  const [satirlar] = await okumaHavuzu.execute(
    "SELECT id, ad, soyad, eposta, rol, ogrenci_no, bakiye, aktif FROM kullanicilar WHERE id = ? LIMIT 1",
    [id]
  );
  return satirlar[0] || null;
}

async function kullaniciBakiyeGetir(id) {
  const [satirlar] = await yazmaHavuzu.execute(
    "SELECT bakiye FROM kullanicilar WHERE id = ? LIMIT 1",
    [id]
  );
  return satirlar[0] || null;
}

async function bakiyeYukle(kullaniciId, tutar) {
  const baglanti = await yazmaHavuzu.getConnection();
  try {
    const [sonuc] = await baglanti.execute(
      "CALL sp_bakiye_yukle(?, ?)",
      [kullaniciId, tutar]
    );
    return sonuc[0][0];
  } finally {
    baglanti.release();
  }
}

async function bakiyeHareketleriGetir(kullaniciId) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT id, tur, tutar, rezervasyon_id, aciklama, olusturma
     FROM bakiye_hareketleri
     WHERE kullanici_id = ?
     ORDER BY olusturma DESC
     LIMIT 50`,
    [kullaniciId]
  );
  return satirlar;
}

module.exports = {
  kullaniciyiEpostaIleGetir,
  kullaniciyiIdIleGetir,
  kullaniciBakiyeGetir,
  bakiyeYukle,
  bakiyeHareketleriGetir
};
