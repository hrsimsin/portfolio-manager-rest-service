const schemeCodeValidator = (ref, MutualFund) => {
  const duplicateSchemeCodeValidator = (schemeCode, { req }) => {
    return new Promise(async (resolve, reject) => {
      const fund = await MutualFund.findOne({ "Scheme Code": schemeCode });
      if (!fund) reject("Invalid Scheme Code.");
      req.fund = fund;
      resolve();
    });
  };

  return ref
    .notEmpty()
    .withMessage("'scheme-code' not provided.")
    .isInt({ min: 100001, max: 999999 })
    .withMessage("Must be an integer in range [100001,999999].")
    .custom(duplicateSchemeCodeValidator);
};

module.exports = schemeCodeValidator;
