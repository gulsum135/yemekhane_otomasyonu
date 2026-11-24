const crypto = require("crypto");
const { kullaniciyiIdIleGetir } = require("../veri/kullaniciVeri");

const OTURUM_SURE = 30 * 60;

async function redisClient() {
  if (!global._redisIstemci) {
    const redis = require("redis");
    const istemci = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || "redis",
        port: Number(process.env.REDIS_PORT) || 6379
      }
    });
    istemci.on("error", (err) => console.error("Redis hatasi:", err));
    await istemci.connect();
    global._redisIstemci = istemci;
  }
  return global._redisIstemci;
}

async function oturumOlustur(kullaniciId) {
  const token = crypto.randomBytes(32).toString("hex");
  const anahtar = `oturum:${token}`;
  const r = await redisClient();
  await r.set(anahtar, String(kullaniciId), { EX: OTURUM_SURE });
  return token;
}

async function oturumDogrula(token) {
  if (!token) return null;
  const anahtar = `oturum:${token}`;
  const r = await redisClient();
  const deger = await r.get(anahtar);
  if (!deger) return null;
  await r.expire(anahtar, OTURUM_SURE);
  return Number(deger);
}

async function oturumSil(token) {
  if (!token) return;
  const r = await redisClient();
  await r.del(`oturum:${token}`);
}

function tokenAl(req) {
  const cookie = req.headers.cookie || "";
  const eslesme = cookie.match(/(?:^|;\s*)oturum=([^;]+)/);
  return eslesme ? eslesme[1] : null;
}

async function kimlikDogrula(req, res, next) {
  const token = tokenAl(req);
  const kullaniciId = await oturumDogrula(token);
  if (!kullaniciId) {
    return res.status(401).json({ mesaj: "Oturum açmanız gerekiyor." });
  }
  req.kullaniciId = kullaniciId;
  req.oturumToken = token;
  next();
}

async function yoneticiMi(req, res, next) {
  try {
    const kullanici = await kullaniciyiIdIleGetir(req.kullaniciId);

    if (!kullanici || kullanici.rol !== "yonetici") {
      return res.status(403).json({
        mesaj: "Bu işlem için yönetici yetkisi gerekiyor."
      });
    }

    next();
  } catch (hata) {
    next(hata);
  }
}

module.exports = { oturumOlustur, oturumSil, tokenAl, kimlikDogrula, yoneticiMi, redisClient };
