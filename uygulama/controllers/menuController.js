const { gunMenusunuGetir, haftalikMenuGetir, menuDetayGetir, menuOlustur, menuYemekEkle, yoneticiMenuListesi, yemekleriGetir } = require("../veri/menuVeri");
const { redisClient } = require("../ara_katman/oturum");
const { kullaniciyiIdIleGetir } = require("../veri/kullaniciVeri");

function gunSonunaKalanSaniye() {
  const simdi = new Date();

  const parcalar = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(simdi);

  const degerler = Object.fromEntries(
    parcalar.map((parca) => [parca.type, parca.value])
  );

  const gecenSaniye =
    Number(degerler.hour) * 3600 +
    Number(degerler.minute) * 60 +
    Number(degerler.second);

  return 86400 - gecenSaniye;
}

function bugunTarih() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
}

function haftaBasi() {
  const bugun = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  const gun = bugun.getDay();
  const fark = gun === 0 ? -6 : 1 - gun;
  bugun.setDate(bugun.getDate() + fark);
  return bugun.toLocaleDateString("sv-SE");
}

function haftaSonu() {
  const bas = new Date(haftaBasi());
  bas.setDate(bas.getDate() + 6);
  return bas.toLocaleDateString("sv-SE");
}

async function gunMenusu(req, res) {
  const { yemekhane_id, ogun_id, tarih } = req.query;
  if (!yemekhane_id || !ogun_id) {
    return res.status(400).json({ mesaj: "yemekhane_id ve ogun_id zorunludur." });
  }
  const gun = tarih || bugunTarih();
  const r = await redisClient();
  const anahtar = `menu:${yemekhane_id}:${gun}:${ogun_id}`;
  const onbellek = await r.get(anahtar);
  if (onbellek) {
    console.log(`[onbellek HIT] ${anahtar}`);
    return res.json(JSON.parse(onbellek));
  }
  console.log(`[onbellek MISS] ${anahtar}`);
  const satirlar = await gunMenusunuGetir(yemekhane_id, ogun_id, gun);
 await r.set(anahtar, JSON.stringify(satirlar), {
  EX: gunSonunaKalanSaniye()
});
  res.json(satirlar);
}

async function haftalikMenu(req, res) {
  const { yemekhane_id } = req.query;

  if (!yemekhane_id) {
    return res.status(400).json({
      mesaj: "yemekhane_id zorunludur."
    });
  }

  const kullanici = await kullaniciyiIdIleGetir(req.kullaniciId);

  if (!kullanici) {
    return res.status(404).json({ mesaj: "Kullanıcı bulunamadı." });
  }

  const satirlar = await haftalikMenuGetir(
    yemekhane_id,
    haftaBasi(),
    haftaSonu()
  );

  const simdi = new Date();

  const sonuc = satirlar.map((menu) => {
    const sureBitti = simdi >= new Date(menu.rezervasyon_son);
    const kapasiteDolu = Number(menu.bos_yer) <= 0;

    return {
      ...menu,
      fiyat: kullanici.rol === "ogrenci"
        ? menu.ogrenci_fiyati
        : menu.personel_fiyati,
      rezervasyon_yapilabilir: !sureBitti && !kapasiteDolu,
      islem_metni: sureBitti
        ? "Süre Doldu"
        : kapasiteDolu
          ? "Kapasite Dolu"
          : "Rezerve Et"
    };
  });

  res.json(sonuc);
}

async function menuDetay(req, res) {
  const satirlar = await menuDetayGetir(req.params.id);
  if (!satirlar.length) return res.status(404).json({ mesaj: "Menü bulunamadı." });
  res.json(satirlar);
}

async function yeniMenuOlustur(req, res) {
  const { yemekhane_id, tarih, ogun_id, ogrenci_fiyati, personel_fiyati, yemek_idleri } = req.body;
  if (!yemekhane_id || !tarih || !ogun_id || !ogrenci_fiyati || !personel_fiyati || !yemek_idleri?.length) {
    return res.status(400).json({ mesaj: "Tüm alanlar zorunludur." });
  }
  const menuId = await menuOlustur(yemekhane_id, tarih, ogun_id, ogrenci_fiyati, personel_fiyati);
  await menuYemekEkle(menuId, yemek_idleri);
  const r = await redisClient();
  await r.del(`menu:${yemekhane_id}:${tarih}:${ogun_id}`);
  res.status(201).json({ menu_id: menuId });
}

async function menuGuncelle(req, res) {
  const menuId = req.params.id;
  const { yemek_idleri } = req.body;
  if (!yemek_idleri?.length) return res.status(400).json({ mesaj: "yemek_idleri zorunludur." });
  const detay = await menuDetayGetir(menuId);
  if (!detay.length) return res.status(404).json({ mesaj: "Menü bulunamadı." });
  await menuYemekEkle(menuId, yemek_idleri);
  const r = await redisClient();
  const { yemekhane_id, tarih, ogun_id } = detay[0];

const tarihMetni = tarih instanceof Date
  ? tarih.toLocaleDateString("sv-SE", {
      timeZone: "Europe/Istanbul"
    })
  : String(tarih).slice(0, 10);

const anahtar = `menu:${yemekhane_id}:${tarihMetni}:${ogun_id}`;

const silinen = await r.del(anahtar);
console.log(`[onbellek SIL] ${anahtar}, silinen: ${silinen}`);
  res.json({ mesaj: "Menü güncellendi." });
}

async function yoneticiPanel(req, res) {
  const { yemekhane_id } = req.query;
  if (!yemekhane_id) return res.status(400).json({ mesaj: "yemekhane_id zorunludur." });
  const liste = await yoneticiMenuListesi(yemekhane_id);
  res.json(liste);
}

async function yemekListesi(req, res) {
  const yemekler = await yemekleriGetir();
  res.json(yemekler);
}

module.exports = { gunMenusu, haftalikMenu, menuDetay, yeniMenuOlustur, menuGuncelle, yoneticiPanel, yemekListesi };
