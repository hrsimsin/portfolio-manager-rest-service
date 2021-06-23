const express = require('express');
const authenticator = require('../middleware/authenticator');
const ResponseUtils = require('../utils/response-utils');
const { query, validationResult } = require('express-validator');
const errorCheck = require('../middleware/error-check');

const getMutualFundRouter = (MutualFund,fundSearch) => {
    const router = express.Router();

    router.get('/',
        authenticator,
        query('name').notEmpty().withMessage(`Query param 'name' not provided.`),
        query('max-results').optional().isInt({min:10,max:100}).withMessage('Must be a integer in range [10,100].'),
        errorCheck,
        async (req, res) => {
            const searchResults = fundSearch.search(req.query.name,{prefix: true, fuzzy:0.2});
            const searchIDs = searchResults.slice(0,Math.min(searchResults.length,req.query['max-results'])).map(el => el.id);
            const funds = await MutualFund.find({'_id':{$in:searchIDs}},['Scheme Code','Scheme Name','AMC Name','Scheme Type']);
            ResponseUtils.success(res, `Query complete.`, funds);
        });

    return router;
}

module.exports = getMutualFundRouter;