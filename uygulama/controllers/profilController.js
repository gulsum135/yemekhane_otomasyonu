const {
  alerjenleriGetir,
  alerjenleriKaydet
} = require("../veri/profilVeri");

const { alerjenlerGetir } = require("../veri/yemekhaneVeri");

async function profilGetir(req, res) {
  const alerjen_idleri = await alerjenleriGetir(req.kullaniciId);
  res.json({ alerjen_idleri });
}

async function profilKaydet(req, res) {
  const { alerjen_idleri } = req.body;

  if (
    !Array.isArray(alerjen_idleri) ||
    alerjen_idleri.some((id) => !Number.isInteger(id))
  ) {
    return res.status(400).json({ mesaj: "Geçersiz alerjen seçimi." });
  }

  const mevcut = await alerjenlerGetir();
  const gecerliIdler = new Set(mevcut.map((a) => Number(a.id)));
  const secimler = [...new Set(alerjen_idleri)];

  if (secimler.some((id) => !gecerliIdler.has(id))) {
    return res.status(400).json({ mesaj: "Geçersiz alerjen seçimi." });
  }

  await alerjenleriKaydet(req.kullaniciId, secimler);

  res.json({
    mesaj: "Alerjen tercihleriniz kaydedildi.",
    alerjen_idleri: secimler
  });
}

module.exports = { profilGetir, profilKaydet };