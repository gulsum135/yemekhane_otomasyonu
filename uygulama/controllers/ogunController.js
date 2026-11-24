const { ogunleriGetir } = require("../veri/ogunVeri");

async function ogunleriListele(req, res) {
  try {
    const ogunler = await ogunleriGetir();
    res.json(ogunler);
  } catch (hata) {
    console.error("Öğünler alınamadı:", hata);
    res.status(500).json({
      mesaj: "Öğünler yüklenirken bir hata oluştu."
    });
  }
}

module.exports = { ogunleriListele };