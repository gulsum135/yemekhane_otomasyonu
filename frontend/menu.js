async function secenekleriYukle(adres, secimId, varsayilanMetin) {
  const secimKutusu = document.getElementById(secimId);

  const yanit = await fetch(adres);

  if (!yanit.ok) {
    throw new Error(`${adres}: HTTP ${yanit.status}`);
  }

  const kayitlar = await yanit.json();

  // Fonksiyon tekrar çalışırsa seçeneklerin çoğalmasını önler.
  secimKutusu.replaceChildren(new Option(varsayilanMetin, ""));

  for (const kayit of kayitlar) {
    secimKutusu.add(new Option(kayit.ad, kayit.id));
  }
}

async function secimleriHazirla() {
  const mesaj = document.getElementById("menu-mesaji");
  mesaj.textContent = "Seçenekler yükleniyor…";

  try {
    await Promise.all([
      secenekleriYukle(
        "/api/yemekhaneler",
        "yemekhane-secimi",
        "Yemekhane seçiniz"
      ),
      secenekleriYukle(
        "/api/ogunler",
        "ogun-secimi",
        "Öğün seçiniz"
      )
    ]);

    mesaj.textContent = "Yemekhane ve öğün seçiniz.";
  } catch (hata) {
    mesaj.textContent = "Seçenekler yüklenemedi. Sayfayı yenileyiniz.";
    console.error(hata);
  }
}

secimleriHazirla();