const jwt = require("jsonwebtoken");
const Config = require("../config");
const ResponseUtils = require("../utils/response-utils");
const User = require("../models/user");

const authenticator = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return ResponseUtils.unauthorized(res, "No auth header provided.");
    else {
      const token = authHeader.split(" ")[1];
      const decodedToken = jwt.verify(token, Config.jwtSecret);
      const email = decodedToken.email;
      const user = await User.findOne({ email });

      if (!user) return ResponseUtils.unauthorized(res, "Unauthorized.");
      else {
        req.user = user;
        next();
      }
    }
  } catch (error) {
    return ResponseUtils.unauthorized(res, "Unauthorized.");
  }
};

module.exports = authenticator;
