let aktifKullanici = null;

function bildirimGoster(mesaj, tur = "hata") {
  const kutu = document.getElementById("genel-bildirim");
  kutu.textContent = mesaj;
  kutu.className = `bildirim bildirim-${tur}`;
  kutu.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bildirimGizle() {
  const kutu = document.getElementById("genel-bildirim");
  kutu.style.display = "none";
}

async function apiIstek(url, secenekler = {}) {
  bildirimGizle();
  const varsayilan = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  };
  const birlesik = { ...varsayilan, ...secenekler };
  if (secenekler.body && typeof secenekler.body === "object") {
    birlesik.body = JSON.stringify(secenekler.body);
  }
  const yanit = await fetch(url, birlesik);
  const veri = await yanit.json().catch(() => ({}));
  if (!yanit.ok) {
    const hataMesaji = veri.mesaj || `Hata (${yanit.status})`;
    throw new Error(hataMesaji);
  }
  return veri;
}

function ekranGoster(ekranId) {
  document.querySelectorAll("main section").forEach((sec) => {
    sec.style.display = "none";
  });
  const hedef = document.getElementById(ekranId);
  if (hedef) hedef.style.display = "block";

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("aktif", btn.getAttribute("data-ekran") === ekranId);
  });
}

function arayuzGuncelle() {
  const girisEkrani = document.getElementById("ekran-giris");
  const navMenu = document.getElementById("ana-menu");
  const bakiyeAlani = document.getElementById("kullanici-bakiye-alani");
  const adSoyadEl = document.getElementById("kullanici-ad-soyad");
  const rolEl = document.getElementById("kullanici-rol");
  const yoneticiNav = document.getElementById("nav-yonetici");

  if (aktifKullanici) {
    girisEkrani.style.display = "none";
    navMenu.style.display = "flex";
    bakiyeAlani.style.display = "block";
    adSoyadEl.textContent = `${aktifKullanici.ad} ${aktifKullanici.soyad}`;
    rolEl.textContent = aktifKullanici.rol;
    rolEl.style.display = "inline-block";
    yoneticiNav.style.display = aktifKullanici.rol === "yonetici" ? "inline-block" : "none";
    bakiyeGuncelle();
    ekranGoster("ekran-gunun-menusu");
  } else {
    girisEkrani.style.display = "block";
    navMenu.style.display = "none";
    bakiyeAlani.style.display = "none";
    adSoyadEl.textContent = "Yemekhane Otomasyonu";
    rolEl.style.display = "none";
    ekranGoster("ekran-giris");
  }
}

async function bakiyeGuncelle() {
  try {
    const veri = await apiIstek("/api/bakiye");
    const tutar = Number(veri.bakiye).toFixed(2);
    document.getElementById("ust-bakiye-deger").textContent = `${tutar} TL`;
    document.getElementById("bakiye-ekran-tutar").textContent = `${tutar} TL`;
    if (veri.hareketler) {
      bakiyeHareketleriDoldur(veri.hareketler);
    }
  } catch (err) {
    console.error(err);
  }
}

function bakiyeHareketleriDoldur(hareketler) {
  const tbody = document.querySelector("#bakiye-hareket-tablo tbody");
  tbody.innerHTML = "";
  hareketler.forEach((h) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(h.olusturma).toLocaleString("tr-TR")}</td>
      <td>${h.tur}</td>
      <td style="font-weight:600; color:${Number(h.tutar) < 0 ? 'var(--hata)' : 'var(--basari)'}">${Number(h.tutar).toFixed(2)} TL</td>
      <td>${h.aciklama || "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function oturumKontrol() {
  try {
    const kullanici = await apiIstek("/api/ben");
    aktifKullanici = kullanici;
  } catch (e) {
    aktifKullanici = null;
  }
  arayuzGuncelle();
}

async function secenekleriDoldur() {
  try {
    const [yemekhaneler, ogunler] = await Promise.all([
      apiIstek("/api/yemekhaneler"),
      apiIstek("/api/ogunler")
    ]);

    const yhSelectler = [
      document.getElementById("gun-yemekhane"),
      document.getElementById("haftalik-yemekhane"),
      document.getElementById("yonetici-yemekhane"),
      document.getElementById("yeni-menu-yemekhane")
    ];
    yhSelectler.forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = "";
      yemekhaneler.forEach((yh) => {
        sel.add(new Option(yh.ad, yh.id));
      });
    });

    const ogunSelectler = [
      document.getElementById("gun-ogun"),
      document.getElementById("yeni-menu-ogun")
    ];
    ogunSelectler.forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = "";
      ogunler.forEach((og) => {
        sel.add(new Option(og.ad, og.id));
      });
    });
  } catch (err) {
    console.error(err);
  }
}

document.getElementById("form-giris").addEventListener("submit", async (e) => {
  e.preventDefault();
  const eposta = document.getElementById("giris-eposta").value.trim();
  const sifre = document.getElementById("giris-sifre").value;
  try {
    const kullanici = await apiIstek("/api/giris", {
      method: "POST",
      body: { eposta, sifre }
    });
    aktifKullanici = kullanici;
    arayuzGuncelle();
    bildirimGoster("Giriş başarılı.", "basari");
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
});

document.getElementById("btn-cikis").addEventListener("click", async () => {
  try {
    await apiIstek("/api/cikis", { method: "POST" });
  } catch (e) {
  }
  aktifKullanici = null;
  arayuzGuncelle();
  bildirimGoster("Çıkış yapıldı.", "basari");
});

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const hedef = btn.getAttribute("data-ekran");
    ekranGoster(hedef);
    if (hedef === "ekran-rezervasyonlarim") rezervasyonlariYukle();
    if (hedef === "ekran-bakiye") bakiyeGuncelle();
    if (hedef === "ekran-degerlendirme") degerlendirilebilirMenuleriYukle();
    if (hedef === "ekran-yonetici") yemekleriYukle();
  });
});

document.getElementById("btn-gun-getir").addEventListener("click", async () => {
  const yhId = document.getElementById("gun-yemekhane").value;
  const ogunId = document.getElementById("gun-ogun").value;
  const tarih = document.getElementById("gun-tarih").value;

  try {
    let url = `/api/menu/gun?yemekhane_id=${yhId}&ogun_id=${ogunId}`;
    if (tarih) url += `&tarih=${tarih}`;
    const liste = await apiIstek(url);

    const tablo = document.getElementById("gun-menu-tablo");
    const tbody = tablo.querySelector("tbody");
    const ozet = document.getElementById("gun-menu-ozet");
    tbody.innerHTML = "";

    if (!liste || liste.length === 0) {
      ozet.textContent = "Bu tarihte ve öğünde menü bulunamadı.";
      ozet.className = "bildirim bildirim-hata";
      ozet.style.display = "block";
      tablo.style.display = "none";
      return;
    }

    let toplamKalori = 0;
    liste.forEach((satir) => {
      toplamKalori += Number(satir.kalori || 0);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${satir.kategori}</td>
        <td><strong>${satir.yemek}</strong></td>
        <td>${satir.kalori} kcal</td>
        <td>${satir.vejetaryen ? "Evet" : "Hayır"}</td>
        <td>${satir.alerjenler || "-"}</td>
      `;
      tbody.appendChild(tr);
    });

    ozet.innerHTML = `Toplam Kalori: <strong>${toplamKalori} kcal</strong> | Öğrenci: ${liste[0].ogrenci_fiyati} TL | Personel: ${liste[0].personel_fiyati} TL`;
    ozet.className = "bildirim bildirim-basari";
    ozet.style.display = "block";
    tablo.style.display = "table";
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
});

document.getElementById("btn-haftalik-getir").addEventListener("click", async () => {
  const yhId = document.getElementById("haftalik-yemekhane").value;
  try {
    const liste = await apiIstek(`/api/menu/haftalik?yemekhane_id=${yhId}`);
    const tbody = document.querySelector("#haftalik-menu-tablo tbody");
    tbody.innerHTML = "";

    if (!liste || liste.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Bu yemekhane için haftalık menü bulunamadı.</td></tr>`;
      return;
    }

    const simdi = new Date();
    liste.forEach((satir) => {
      const sonZaman = new Date(satir.rezervasyon_son);
      const fiyat = satir.fiyat;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(satir.tarih).toLocaleDateString("tr-TR")}</td>
        <td>${satir.ogun}</td>
        <td>${satir.bos_yer}</td>
        <td>${fiyat} TL</td>
        <td>${sonZaman.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</td>
        <td>
          <button class="dugme dugme-otomatik btn-rezerve" 
            data-id="${satir.menu_id}"
            ${satir.rezervasyon_yapilabilir ? "" : "disabled"}>
            ${satir.islem_metni}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-rezerve").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const menuId = btn.getAttribute("data-id");
        try {
          const sonuc = await apiIstek("/api/rezervasyon", {
            method: "POST",
            body: { menu_id: Number(menuId) }
          });
          bildirimGoster(`Rezervasyon başarılı! Kalan Bakiye: ${Number(sonuc.bakiye).toFixed(2)} TL`, "basari");
          bakiyeGuncelle();
          document.getElementById("btn-haftalik-getir").click();
        } catch (err) {
          bildirimGoster(err.message, "hata");
        }
      });
    });
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
});

async function rezervasyonlariYukle() {
  try {
    const liste = await apiIstek("/api/rezervasyonlarim");
    const tbody = document.querySelector("#rezervasyonlar-tablo tbody");
    tbody.innerHTML = "";

    if (!liste || liste.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Henüz bir rezervasyonunuz yok.</td></tr>`;
      return;
    }

    const simdi = new Date();
    liste.forEach((r) => {
      const sonZaman = new Date(r.rezervasyon_son);
      const iptalEdilebilir = r.iptal_edilebilir;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(r.tarih).toLocaleDateString("tr-TR")}</td>
        <td>${r.yemekhane}</td>
        <td>${r.ogun}</td>
        <td>${Number(r.ucret).toFixed(2)} TL</td>
        <td><span class="etiket etiket-${r.durum}">${r.durum}</span></td>
        <td>
          ${iptalEdilebilir ? `<button class="dugme dugme-tehlike dugme-otomatik btn-iptal" data-id="${r.id}">İptal Et</button>` : "-"}
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-iptal").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Rezervasyonu iptal etmek istediğinize emin misiniz?")) return;
        try {
          const sonuc = await apiIstek(`/api/rezervasyon/${id}`, { method: "DELETE" });
          bildirimGoster(`Rezervasyon iptal edildi. İade: ${Number(sonuc.iade).toFixed(2)} TL. Yeni Bakiye: ${Number(sonuc.bakiye).toFixed(2)} TL`, "basari");
          bakiyeGuncelle();
          rezervasyonlariYukle();
        } catch (err) {
          bildirimGoster(err.message, "hata");
        }
      });
    });
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
}

document.getElementById("btn-rezervasyon-yenile").addEventListener("click", rezervasyonlariYukle);

document.getElementById("form-bakiye-yukle").addEventListener("submit", async (e) => {
  e.preventDefault();
  const tutar = Number(document.getElementById("bakiye-yukle-tutar").value);
  try {
    const sonuc = await apiIstek("/api/bakiye/yukle", {
      method: "POST",
      body: { tutar }
    });
    bildirimGoster(`Bakiye yüklendi. Güncel Bakiye: ${Number(sonuc.bakiye).toFixed(2)} TL`, "basari");
    document.getElementById("bakiye-yukle-tutar").value = "";
    bakiyeGuncelle();
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
});

async function degerlendirilebilirMenuleriYukle() {
  try {
    const liste = await apiIstek("/api/degerlendirme/menuler");
    const sel = document.getElementById("degerlendirme-menu-secim");
    sel.innerHTML = "";

    if (!liste || liste.length === 0) {
      sel.add(new Option("Değerlendirilecek menü bulunamadı", ""));
      return;
    }

    liste.forEach((m) => {
      const etiket = `${new Date(m.tarih).toLocaleDateString("tr-TR")} - ${m.yemekhane} - ${m.ogun}${m.mevcut_puan ? ` (Verilen Puan: ${m.mevcut_puan})` : ""}`;
      sel.add(new Option(etiket, m.menu_id));
    });
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
}

document.getElementById("form-degerlendirme").addEventListener("submit", async (e) => {
  e.preventDefault();
  const menuId = document.getElementById("degerlendirme-menu-secim").value;
  const puan = Number(document.getElementById("degerlendirme-puan").value);
  const yorum = document.getElementById("degerlendirme-yorum").value.trim();

  if (!menuId) {
    bildirimGoster("Lütfen bir menü seçiniz.", "hata");
    return;
  }

  try {
    const sonuc = await apiIstek("/api/degerlendirme", {
      method: "POST",
      body: { menu_id: Number(menuId), puan, yorum }
    });
    bildirimGoster(sonuc.mesaj || "Değerlendirme kaydedildi.", "basari");
    document.getElementById("degerlendirme-yorum").value = "";
    degerlendirilebilirMenuleriYukle();
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
});

document.getElementById("btn-yonetici-rapor").addEventListener("click", async () => {
  const yhId = document.getElementById("yonetici-yemekhane").value;
  try {
    const liste = await apiIstek(`/api/yonetici/panel?yemekhane_id=${yhId}`);
    const tbody = document.querySelector("#yonetici-rapor-tablo tbody");
    tbody.innerHTML = "";

    if (!liste || liste.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9">Kayıt bulunamadı.</td></tr>`;
      return;
    }

    liste.forEach((satir) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(satir.tarih).toLocaleDateString("tr-TR")}</td>
        <td>${satir.ogun}</td>
        <td>${satir.kapasite}</td>
        <td>${satir.rezerve}</td>
        <td>${satir.bos_yer}</td>
        <td>%${satir.doluluk_yuzde}</td>
        <td>${satir.oy_sayisi || 0}</td>
        <td>${satir.ortalama_puan ? Number(satir.ortalama_puan).toFixed(1) : "-"}</td>
        <td>
          <button type="button"
                  class="dugme dugme-otomatik btn-menu-duzenle"
                  data-id="${satir.menu_id}">
            Düzenle
          </button>
        </td>
      `;
      tbody.appendChild(tr);

      tr.querySelector(".btn-menu-duzenle").addEventListener("click", () => {
        menuDuzenlemeyiAc(satir.menu_id).catch((hata) => {
          bildirimGoster(hata.message, "hata");
        });
      });
    });
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
});

async function yemekleriYukle() {
  try {
    const yemekler = await apiIstek("/api/yemekler");
    const sel = document.getElementById("yeni-menu-yemekler");
    sel.innerHTML = "";
    yemekler.forEach((y) => {
      sel.add(new Option(`[${y.kategori}] ${y.ad} (${y.kalori} kcal)`, y.id));
    });
  } catch (err) {
    console.error(err);
  }
}

document.getElementById("form-yeni-menu").addEventListener("submit", async (e) => {
  e.preventDefault();
  const yemekhane_id = Number(document.getElementById("yeni-menu-yemekhane").value);
  const ogun_id = Number(document.getElementById("yeni-menu-ogun").value);
  const tarih = document.getElementById("yeni-menu-tarih").value;
  const ogrenci_fiyati = Number(document.getElementById("yeni-menu-ogr-fiyat").value);
  const personel_fiyati = Number(document.getElementById("yeni-menu-per-fiyat").value);
  
  const yemekSelect = document.getElementById("yeni-menu-yemekler");
  const yemek_idleri = Array.from(yemekSelect.selectedOptions).map((op) => Number(op.value));

  if (yemek_idleri.length === 0) {
    bildirimGoster("Lütfen en az bir yemek seçiniz.", "hata");
    return;
  }

  try {
    await apiIstek("/api/yonetici/menu", {
      method: "POST",
      body: {
        yemekhane_id,
        ogun_id,
        tarih,
        ogrenci_fiyati,
        personel_fiyati,
        yemek_idleri
      }
    });
    bildirimGoster("Yeni menü başarıyla oluşturuldu.", "basari");
    document.getElementById("btn-yonetici-rapor").click();
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
});

const bugun = new Date().toISOString().split("T")[0];
document.getElementById("gun-tarih").value = bugun;
document.getElementById("yeni-menu-tarih").value = bugun;

secenekleriDoldur();
oturumKontrol();

async function menuDuzenlemeyiAc(menuId) {
  const [detay, yemekler] = await Promise.all([
    apiIstek(`/api/menu/${menuId}`),
    apiIstek("/api/yemekler")
  ]);

  if (!detay.length) {
    throw new Error("Menü bulunamadı.");
  }

  const seciliYemekler = new Set(
    detay.map((satir) => Number(satir.yemek_id))
  );

  const secim = document.getElementById("duzenlenen-menu-yemekler");
  secim.replaceChildren();

  for (const yemek of yemekler) {
    const secenek = new Option(
      `[${yemek.kategori}] ${yemek.ad} (${yemek.kalori} kcal)`,
      yemek.id
    );
    secenek.selected = seciliYemekler.has(Number(yemek.id));
    secim.add(secenek);
  }

  document.getElementById("duzenlenen-menu-id").value = menuId;
  document.getElementById("duzenlenen-menu-bilgisi").textContent =
    `${new Date(detay[0].tarih).toLocaleDateString("tr-TR")} - ${detay[0].yemekhane} - ${detay[0].ogun}`;

  document.getElementById("form-menu-duzenle").style.display = "block";
  document.getElementById("form-menu-duzenle").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("form-menu-duzenle").addEventListener("submit", async (e) => {
  e.preventDefault();
  const menuId = document.getElementById("duzenlenen-menu-id").value;
  const secim = document.getElementById("duzenlenen-menu-yemekler");
  const yemek_idleri = Array.from(secim.selectedOptions).map((op) => Number(op.value));

  if (yemek_idleri.length === 0) {
    bildirimGoster("Lütfen en az bir yemek seçiniz.", "hata");
    return;
  }

  try {
    const sonuc = await apiIstek(`/api/yonetici/menu/${menuId}`, {
      method: "PUT",
      body: { yemek_idleri }
    });
    bildirimGoster(sonuc.mesaj || "Menü başarıyla güncellendi.", "basari");
    document.getElementById("form-menu-duzenle").style.display = "none";
    document.getElementById("btn-yonetici-rapor").click();
  } catch (err) {
    bildirimGoster(err.message, "hata");
  }
});

document.getElementById("btn-duzenleme-vazgec").addEventListener("click", () => {
  document.getElementById("form-menu-duzenle").style.display = "none";
});
