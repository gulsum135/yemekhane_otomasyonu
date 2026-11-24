const { okumaHavuzu, yazmaHavuzu } = require("./baglanti");

async function alerjenleriGetir(kullaniciId) {
  const [satirlar] = await okumaHavuzu.execute(
    `SELECT alerjen_id
     FROM kullanici_alerjenleri
     WHERE kullanici_id = ?`,
    [kullaniciId]
  );

  return satirlar.map((satir) => satir.alerjen_id);
}

async function alerjenleriKaydet(kullaniciId, alerjenIdleri) {
  const baglanti = await yazmaHavuzu.getConnection();

  try {
    await baglanti.beginTransaction();

    // Aynı kullanıcının eşzamanlı profil güncellemelerini sıraya alır.
    await baglanti.execute(
      "SELECT id FROM kullanicilar WHERE id = ? FOR UPDATE",
      [kullaniciId]
    );

    await baglanti.execute(
      "DELETE FROM kullanici_alerjenleri WHERE kullanici_id = ?",
      [kullaniciId]
    );

    for (const alerjenId of alerjenIdleri) {
      await baglanti.execute(
        `INSERT INTO kullanici_alerjenleri
         (kullanici_id, alerjen_id) VALUES (?, ?)`,
        [kullaniciId, alerjenId]
      );
    }

    await baglanti.commit();
  } catch (hata) {
    await baglanti.rollback();
    throw hata;
  } finally {
    baglanti.release();
  }
}

module.exports = { alerjenleriGetir, alerjenleriKaydet };