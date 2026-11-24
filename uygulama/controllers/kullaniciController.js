const bcrypt = require("bcrypt");
const { kullaniciyiEpostaIleGetir, kullaniciyiIdIleGetir, kullaniciBakiyeGetir, bakiyeYukle, bakiyeHareketleriGetir } = require("../veri/kullaniciVeri");
const { oturumOlustur, oturumSil, tokenAl } = require("../ara_katman/oturum");

async function girisYap(req, res) {
  const { eposta, sifre } = req.body;
  if (!eposta || !sifre) {
    return res.status(400).json({ mesaj: "E-posta ve şifre zorunludur." });
  }
  const kullanici = await kullaniciyiEpostaIleGetir(eposta);
  if (!kullanici) {
    return res.status(401).json({ mesaj: "E-posta veya şifre hatalı." });
  }
  if (!kullanici.aktif) {
    return res.status(401).json({ mesaj: "Hesabınız pasif durumda." });
  }
  const eslesti = await bcrypt.compare(sifre, kullanici.sifre_hash);
  if (!eslesti) {
    return res.status(401).json({ mesaj: "E-posta veya şifre hatalı." });
  }
  const token = await oturumOlustur(kullanici.id);
  res.setHeader("Set-Cookie", `oturum=${token}; HttpOnly; Path=/; Max-Age=1800; SameSite=Lax`);
  res.json({
    id: kullanici.id,
    ad: kullanici.ad,
    soyad: kullanici.soyad,
    eposta: kullanici.eposta,
    rol: kullanici.rol,
    ogrenci_no: kullanici.ogrenci_no,
    bakiye: kullanici.bakiye
  });
}

async function cikisYap(req, res) {
  const token = tokenAl(req);
  await oturumSil(token);
  res.setHeader("Set-Cookie", "oturum=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  res.json({ mesaj: "Çıkış yapıldı." });
}

async function benimBilgilerim(req, res) {
  const kullanici = await kullaniciyiIdIleGetir(req.kullaniciId);
  if (!kullanici) return res.status(404).json({ mesaj: "Kullanıcı bulunamadı." });
  res.json(kullanici);
}

async function bakiyeBilgisi(req, res) {
  const kaynakBakiye = await kullaniciBakiyeGetir(req.kullaniciId);
  if (!kaynakBakiye) return res.status(404).json({ mesaj: "Kullanıcı bulunamadı." });
  const hareketler = await bakiyeHareketleriGetir(req.kullaniciId);
  res.json({ bakiye: kaynakBakiye.bakiye, hareketler });
}

async function bakiyeYukleHandler(req, res) {
  const tutar = Number(req.body.tutar);
  if (!tutar || tutar < 10 || tutar > 1000) {
    return res.status(400).json({ mesaj: "Yükleme tutarı 10 ile 1000 TL arasında olmalıdır." });
  }
  const sonuc = await bakiyeYukle(req.kullaniciId, tutar);
  res.json(sonuc);
}

module.exports = { girisYap, cikisYap, benimBilgilerim, bakiyeBilgisi, bakiyeYukleHandler };
