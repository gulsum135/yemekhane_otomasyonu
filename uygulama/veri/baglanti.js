const mysql = require("mysql2/promise");

const okumaHavuzu = mysql.createPool({
  host: process.env.DB_OKUMA_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_KULLANICI,
  password: process.env.DB_SIFRE,
  database: process.env.DB_ADI,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 5
});

const yazmaHavuzu = mysql.createPool({
  host: process.env.DB_YAZMA_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_KULLANICI,
  password: process.env.DB_SIFRE,
  database: process.env.DB_ADI,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 5
});

module.exports = { okumaHavuzu, yazmaHavuzu };