const { okumaHavuzu } = require("./baglanti");

async function alerjenlerGetir() {
  const [satirlar] = await okumaHavuzu.execute(
    "SELECT id, ad FROM alerjenler ORDER BY ad"
  );
  return satirlar;
}

async function yemekhaneleriGetir() {
  const [satirlar] = await okumaHavuzu.execute(
    "SELECT id, ad, konum, kapasite FROM yemekhaneler ORDER BY id"
  );

  return satirlar;
}

module.exports = { yemekhaneleriGetir, alerjenlerGetir };