const express = require("express");
const authenticator = require("../middleware/authenticator");
const ResponseUtils = require("../utils/response-utils");
const { query, validationResult, param } = require("express-validator");
const errorCheck = require("../middleware/error-check");

const getMutualFundRouter = (MutualFund, fundSearch) => {
  const schemeCodeValidator = (schemeCode) => {
    return new Promise(async (resolve, reject) => {
      if (!(await MutualFund.exists({ "Scheme Code": schemeCode })))
        reject("Invalid Scheme Code.");
      resolve();
    });
  };

  const router = express.Router();

  router.get(
    "/",
    authenticator,
    query("name").notEmpty().withMessage(`Query param 'name' not provided.`),
    query("max-results")
      .optional()
      .isInt({ min: 10, max: 100 })
      .withMessage("Must be an integer in range [10,100]."),
    errorCheck,
    async (req, res) => {
      const searchResults = fundSearch.search(req.query.name, {
        prefix: true,
        fuzzy: 0.2,
      });
      const searchIDs = searchResults
        .slice(0, Math.min(searchResults.length, req.query["max-results"]))
        .map((el) => el.id);
      const funds = await MutualFund.find({ _id: { $in: searchIDs } }, [
        "Scheme Code",
        "Scheme Name",
        "AMC Name",
        "Scheme Type",
      ]);
      ResponseUtils.success(res, `Query complete.`, funds);
    }
  );

  router.get(
    "/:scheme_code",
    authenticator,
    param("scheme_code")
      .isInt({ min: 100001, max: 999999 })
      .withMessage("Must be an integer in range [100001,999999].")
      .custom(schemeCodeValidator),
    errorCheck,
    async (req, res) => {
      const fund = await MutualFund.findOne({
        "Scheme Code": req.params["scheme_code"],
      });
      ResponseUtils.success(res, "Fund fetched.", fund);
    }
  );

  return router;
};

module.exports = getMutualFundRouter;
