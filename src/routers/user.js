const authenticator = require("../middleware/authenticator");
const { body } = require("express-validator");
const errorCheck = require("../middleware/error-check");
const schemeCodeValidator = require("../validators/scheme-code");
const ResponseUtils = require("../utils/response-utils");
const express = require("express");
const User = require("../models/user");

const getUserRouter = (MutualFund) => {
  const router = express.Router();

  const transactionTypeValidator = (transactionType) => {
    return new Promise(async (resolve, reject) => {
      if (transactionType === "buy" || transactionType === "sell") resolve();
      reject(`Param 'type' must be either 'buy' or 'sell'.`);
    });
  };

  const unitsSellValidator = (units, { req }) => {
    return new Promise(async (resolve, reject) => {
      if (req.body.type === "sell") {
        let schemeObj = req.user.transactions.filter(
          (el) => el["Scheme Code"] === req.fund["Scheme Code"]
        )[0];

        if (!schemeObj)
          reject(
            `Cannot register sell transaction of ${req.body.units}. Units owned till this date are 0.`
          );

        let totalUnits = 0;
        const sellDate = new Date(req.body["nav-date"]);
        for (let transaction of schemeObj.schemeTransactions) {
          if (new Date(transaction.navDate) < sellDate) {
            if (transaction.type === "buy") totalUnits += transaction.units;
            else totalUnits -= transaction.units;
          }
        }
        if (totalUnits < req.body.units)
          reject(
            `Cannot register sell transaction of ${req.body.units}. Units owned till this date are ${totalUnits}.`
          );
      }
      resolve();
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
    body("units").custom(unitsSellValidator),
    errorCheck,
    async (req, res) => {
      let schemeObj = req.user.transactions.filter(
        (el) => el["Scheme Code"] === req.fund["Scheme Code"]
      )[0];
      if (!schemeObj) {
        schemeObj = {
          "Scheme Code": req.fund["Scheme Code"],
          schemeTransactions: [],
        };
        req.user.transactions.push(schemeObj);
        schemeObj = req.user.transactions[req.user.transactions.length - 1];
      }

      schemeObj.schemeTransactions.push({
        type: req.body.type,
        navDate: req.navObj._id,
        nav: req.navObj.NAV,
        units: req.body.units,
      });
      await req.user.save();

      ResponseUtils.success(res, "Transaction registered successfully.");
    }
  );

  return router;
};

module.exports = getUserRouter;
