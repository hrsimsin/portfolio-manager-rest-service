const express = require('express');
const mongoose = require('mongoose');
const Config = require('../config');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const ResponseUtils = require('../utils/response-utils');

const getAuthRouter = () => {
    return new Promise(async (resolve,reject)=>{
        const router = express.Router();
        await mongoose.connect(Config.databaseUrl,{useNewUrlParser:true, useUnifiedTopology: true}).catch((reason)=>{reject(reason)});

        router.post('/signup',async(req,res)=>{
            const {email,password,name} = req.body;
            await User.create({
                email,name,
                password : await bcrypt.hash(password,10)
            });
            ResponseUtils.successMessage(res,'User signed up.');
        });

        resolve(router);
    });
}

module.exports = getAuthRouter;