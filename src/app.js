(async () => {
    const express = require('express');
    const Config = require('./config');
    const app = express();

    const auth = await require('./routers/auth')();

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use('/auth',auth);

    app.listen(Config.port, Config.ip);
    console.log(`Server is listening on ${Config.ip}:${Config.port}`);
})();