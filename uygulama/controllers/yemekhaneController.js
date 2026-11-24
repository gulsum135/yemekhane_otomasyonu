const { yemekhaneleriGetir, alerjenlerGetir } = require("../veri/yemekhaneVeri");

async function yemekhaneleriListele(req, res) {
  try {
    const yemekhaneler = await yemekhaneleriGetir();
    res.json(yemekhaneler);
  } catch (hata) {
    console.error("Yemekhaneler alınamadı:", hata);
    res.status(500).json({ mesaj: "Yemekhaneler yüklenirken bir hata oluştu." });
  }
}

async function alerjenlerListele(req, res) {
  try {
    const alerjenler = await alerjenlerGetir();
    res.json(alerjenler);
  } catch (hata) {
    console.error("Alerjenler alınamadı:", hata);
    res.status(500).json({ mesaj: "Alerjenler yüklenirken bir hata oluştu." });
  }
}

module.exports = { yemekhaneleriListele, alerjenlerListele };