const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Config = require('../config');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const ResponseUtils = require('../utils/response-utils');

const getAuthRouter = () => {
    return new Promise(async (resolve, reject) => {
        const router = express.Router();
        await mongoose.connect(Config.databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }).catch((reason) => { reject(reason) });

        router.post('/signup', async (req, res) => {
            const { email, password, name } = req.body;

            await User.create({
                email, name,
                password: await bcrypt.hash(password, 10)
            }).catch((reason) => { ResponseUtils.serverError(res); });

            ResponseUtils.success(res, 'User signed up.');
        });

        router.post('/login', async (req, res) => {
            const { email, password } = req.body;
            try {
                const user = await User.findOne({ email });
                if (user && await bcrypt.compare(password, user.password)) {
                    ResponseUtils.success(res,'Access Token Generated.',{
                        accessToken : jwt.sign({email: user.email},Config.jwtSecret),
                        name: user.name
                    });
                }
                else{
                    ResponseUtils.unauthorized(res,'Invalid email / password.');
                }
            }
            catch (error) {
                ResponseUtils.serverError(res);
            }
        });

        resolve(router);
    });
}

module.exports = getAuthRouter;