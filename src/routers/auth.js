const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Config = require('../config');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const ResponseUtils = require('../utils/response-utils');

const getAuthRouter = () => {
    return new Promise(async (resolve, reject) => {
        const router = express.Router();
        await mongoose.connect(Config.databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }).catch((reason) => { reject(reason) });

        const duplicateEmailValidator = (email) => {
            return new Promise(async (resolve, reject) => {
                const user = await User.findOne({ email });
                if (user)
                    reject('Email already in use.')
                resolve();
            });
        }

        router.post('/signup',
            body('email').normalizeEmail().isEmail().withMessage('Invalid Email.').custom(duplicateEmailValidator),
            body('password').notEmpty().withMessage('Param password not provided.'),
            body('name').notEmpty().withMessage('Param name not provided.'),
            async (req, res) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    ResponseUtils.badRequest(res, 'Bad Request.', errors.array());
                }
                else {
                    const { email, password, name } = req.body;

                    await User.create({
                        email, name,
                        password: await bcrypt.hash(password, 10)
                    }).catch((reason) => { ResponseUtils.serverError(res); });

                    ResponseUtils.success(res, 'User signed up.');
                }
            });

        router.post('/login',
            body('email').normalizeEmail().isEmail().withMessage('Invalid Email.'),
            body('password').notEmpty().withMessage('Param password not provided.'),
            async (req, res) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    ResponseUtils.badRequest(res, 'Bad Request.', errors.array());
                }
                else {
                    const { email, password } = req.body;
                    try {
                        const user = await User.findOne({ email });
                        if (user && await bcrypt.compare(password, user.password)) {
                            ResponseUtils.success(res, 'Access Token Generated.', {
                                accessToken: jwt.sign({ email: user.email }, Config.jwtSecret),
                                name: user.name
                            });
                        }
                        else {
                            ResponseUtils.unauthorized(res, 'Invalid email / password.');
                        }
                    }
                    catch (error) {
                        ResponseUtils.serverError(res);
                    }
                }
            });

        resolve(router);
    });
}

module.exports = getAuthRouter;