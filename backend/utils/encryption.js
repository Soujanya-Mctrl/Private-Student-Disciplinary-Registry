const CryptoJS = require("crypto-js");

const SECRET = process.env.DB_SECRET;

if (!SECRET) {
  throw new Error("DB_SECRET environment variable is required");
}

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
}

function decrypt(cipher) {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };
