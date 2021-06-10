const express = require('express');
const Config = require('./config');

const app = express();

app.listen(Config.port,Config.ip);
console.log(`Server is listening on ${Config.ip}:${Config.port}`);