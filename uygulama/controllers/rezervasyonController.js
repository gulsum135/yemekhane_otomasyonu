const { rezervasyonYap, rezervasyonIptal, kullaniciRezervasyonlariGetir } = require("../veri/rezervasyonVeri");

async function rezervasyonYapHandler(req, res) {
  const { menu_id } = req.body;
  if (!menu_id) return res.status(400).json({ mesaj: "menu_id zorunludur." });
  const sonuc = await rezervasyonYap(req.kullaniciId, menu_id);
  res.status(201).json(sonuc);
}

async function rezervasyonIptalHandler(req, res) {
  const sonuc = await rezervasyonIptal(req.kullaniciId, req.params.id);
  res.json(sonuc);
}

async function rezervasyonlarimiGetir(req, res) {
  const liste = await kullaniciRezervasyonlariGetir(req.kullaniciId);
  const simdi = new Date();

  const sonuc = liste.map((rezervasyon) => ({
    ...rezervasyon,
    iptal_edilebilir:
      rezervasyon.durum === "aktif" &&
      simdi < new Date(rezervasyon.rezervasyon_son)
  }));

  res.json(sonuc);
}

module.exports = { rezervasyonYapHandler, rezervasyonIptalHandler, rezervasyonlarimiGetir };
