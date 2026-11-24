const { okumaHavuzu } = require("./baglanti");

async function ogunleriGetir() {
  const [satirlar] = await okumaHavuzu.execute(
    "SELECT id, ad, son_saat FROM ogunler ORDER BY sira"
  );

  return satirlar;
}

module.exports = { ogunleriGetir };