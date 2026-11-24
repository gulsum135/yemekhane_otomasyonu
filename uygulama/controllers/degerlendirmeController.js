const { degerlendirmeEkle, kullanilmisMenuleriGetir } = require("../veri/degerlendirmeVeri");
const { kullanildiBirRezervasyonVarMi } = require("../veri/rezervasyonVeri");

async function degerlendirmeEkleHandler(req, res) {
  const { menu_id, puan, yorum } = req.body;
  if (!menu_id || !puan) return res.status(400).json({ mesaj: "menu_id ve puan zorunludur." });
  if (puan < 1 || puan > 5) return res.status(400).json({ mesaj: "Puan 1 ile 5 arasında olmalıdır." });
  const kullanildi = await kullanildiBirRezervasyonVarMi(req.kullaniciId, menu_id);
  if (!kullanildi) return res.status(403).json({ mesaj: "Yalnızca kullandığınız menüleri değerlendirebilirsiniz." });
  await degerlendirmeEkle(req.kullaniciId, menu_id, puan, yorum);
  res.json({ mesaj: "Değerlendirme kaydedildi." });
}

async function degerlendirilebilirMenuler(req, res) {
  const liste = await kullanilmisMenuleriGetir(req.kullaniciId);
  res.json(liste);
}

module.exports = { degerlendirmeEkleHandler, degerlendirilebilirMenuler };
