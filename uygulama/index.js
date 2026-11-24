const express = require("express");
const app = express();
const PORT = 8000;

app.use(express.json());

const { yemekhaneleriListele, alerjenlerListele } = require("./controllers/yemekhaneController");
const { ogunleriListele } = require("./controllers/ogunController");
const { girisYap, cikisYap, benimBilgilerim, bakiyeBilgisi, bakiyeYukleHandler } = require("./controllers/kullaniciController");
const { gunMenusu, haftalikMenu, menuDetay, yeniMenuOlustur, menuGuncelle, yoneticiPanel, yemekListesi } = require("./controllers/menuController");
const { rezervasyonYapHandler, rezervasyonIptalHandler, rezervasyonlarimiGetir } = require("./controllers/rezervasyonController");
const { degerlendirmeEkleHandler, degerlendirilebilirMenuler } = require("./controllers/degerlendirmeController");
const { kimlikDogrula, yoneticiMi } = require("./ara_katman/oturum");

function hataYakala(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch((hata) => {
    console.error(hata);
    const mesaj = hata.sqlMessage || hata.message || "Sunucu hatası.";
    res.status(500).json({ mesaj });
  });
}

app.get("/api/saglik", (req, res) => res.json({ durum: "calisiyor" }));

app.get("/api/yemekhaneler", hataYakala(yemekhaneleriListele));
app.get("/api/ogunler", hataYakala(ogunleriListele));
app.get("/api/alerjenler", hataYakala(alerjenlerListele));

app.post("/api/giris", hataYakala(girisYap));
app.post("/api/cikis", hataYakala(cikisYap));

app.get("/api/ben", kimlikDogrula, hataYakala(benimBilgilerim));
app.get("/api/bakiye", kimlikDogrula, hataYakala(bakiyeBilgisi));
app.post("/api/bakiye/yukle", kimlikDogrula, hataYakala(bakiyeYukleHandler));

app.get("/api/menu/gun", kimlikDogrula, hataYakala(gunMenusu));
app.get("/api/menu/haftalik", kimlikDogrula, hataYakala(haftalikMenu));
app.get("/api/menu/:id", kimlikDogrula, hataYakala(menuDetay));
app.get("/api/yemekler", kimlikDogrula, hataYakala(yemekListesi));

app.get("/api/rezervasyonlarim", kimlikDogrula, hataYakala(rezervasyonlarimiGetir));
app.post("/api/rezervasyon", kimlikDogrula, hataYakala(rezervasyonYapHandler));
app.delete("/api/rezervasyon/:id", kimlikDogrula, hataYakala(rezervasyonIptalHandler));

app.get("/api/degerlendirme/menuler", kimlikDogrula, hataYakala(degerlendirilebilirMenuler));
app.post("/api/degerlendirme", kimlikDogrula, hataYakala(degerlendirmeEkleHandler));

app.get("/api/yonetici/panel", kimlikDogrula, yoneticiMi, hataYakala(yoneticiPanel));
app.post("/api/yonetici/menu", kimlikDogrula, yoneticiMi, hataYakala(yeniMenuOlustur));
app.put("/api/yonetici/menu/:id", kimlikDogrula, yoneticiMi, hataYakala(menuGuncelle));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sunucu ${PORT} portunda calisiyor.`);
});
