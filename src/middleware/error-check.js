const { validationResult } = require("express-validator");
const ResponseUtils = require("../utils/response-utils");

const errorCheck = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    ResponseUtils.badRequest(res, "Bad Request.", errors.array());
  } else {
    next();
  }
};

module.exports = errorCheck;
