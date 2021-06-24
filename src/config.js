const ConfigSecret = require("./config-secret");

class Config {
  static port = ConfigSecret.port;
  static ip = ConfigSecret.ip;
  static jwtSecret = ConfigSecret.jwtSecret;
  static databaseUrl = ConfigSecret.databaseUrl;
}

module.exports = Config;
