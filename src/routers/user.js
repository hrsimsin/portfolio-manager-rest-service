const authenticator = require("../middleware/authenticator");
const { body } = require("express-validator");
const errorCheck = require("../middleware/error-check");
const schemeCodeValidator = require("../validators/scheme-code");
const ResponseUtils = require("../utils/response-utils");
const express = require("express");

const getUserRouter = (MutualFund) => {
  const router = express.Router();

  const transactionTypeValidator = (transactionType) => {
    return new Promise(async (resolve, reject) => {
      if (transactionType === "buy" || transactionType === "sell") resolve();
      reject(`Param 'type' must be either 'buy' or 'sell'.`);
    });
  };

  const navDateValidator = (navDate, { req }) => {
    return new Promise(async (resolve, reject) => {
      const dateComps = navDate.split("-");
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      if (dateComps.length !== 3) reject("Invalid nav-date.");
      if (!months.includes(dateComps[1])) reject("Invalid nav-date");
      if (isNaN(dateComps[0]) || isNaN(dateComps[2]))
        reject("Invalid nav-date.");
      const navObj = req.fund.NAVs.filter((el) => el._id === navDate)[0];
      if (!navObj) reject("Invalid nav-date.");
      req.navObj = navObj;
      resolve();
    });
  };

  router.post(
    "/transaction",
    authenticator,
    body("type")
      .notEmpty()
      .withMessage("Body param 'type' not provided.")
      .isAlpha()
      .withMessage("Invalid type.")
      .toLowerCase()
      .custom(transactionTypeValidator),
    schemeCodeValidator(body("scheme-code"), MutualFund),
    errorCheck,
    body("nav-date")
      .notEmpty()
      .withMessage("Body param 'nav-date' not provided."),
    errorCheck,
    body("nav-date").custom(navDateValidator),
    body("units")
      .notEmpty()
      .withMessage(`Param 'units' not provided`)
      .isFloat({ min: 0.001, max: 99999999 })
      .withMessage("Must be a float in range [0.001,99999999]."),
    errorCheck,
    async (req, res) => {
      ResponseUtils.success(res);
    }
  );

  return router;
};

module.exports = getUserRouter;
