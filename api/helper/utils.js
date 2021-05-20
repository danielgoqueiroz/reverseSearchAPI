var crypto = require("crypto");
const md5sum = crypto.createHash("md5");
const fs = require("fs");

module.exports = {
  readFile(path) {
    if (fs.existsSync(path)) {
      console.log("Dado carregado do histórico");
      return JSON.parse(fs.readFileSync(path));
    }
  },
  getHash(value) {
    return crypto.createHash("md5").update(value).digest("hex");
  },
  validate(value) {
    if (value !== undefined && value !== null && value.length > 0) {
      return value;
    } else {
      return null;
    }
  },
  isLinkValid(link) {
    try {
      new URL(link).hostname;
      return true;
    } catch (_) {
      return false;
    }
  },
  isEmailValid(email) {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      email
    );
  },
};
