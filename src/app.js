(async () => {
  const express = require("express");
  const mongoose = require("mongoose");
  const cron = require("node-cron");
  const Config = require("./config");
  const navDB = await require("amfi-database-creator").getInstance(
    Config.databaseUrl
  );
  const MiniSearch = require("minisearch");

  const fundSearch = new MiniSearch({
    fields: ["Scheme Name"],
    storeFields: [],
  });

  const app = express();

  await mongoose.connect(Config.databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  const updateFunds = require("./jobs/funds-update")(navDB, fundSearch);
  await updateFunds();

  cron.schedule("0 5 1,9,13,14 * * *", updateFunds);

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use("/auth", require("./routers/auth"));
  app.use(
    "/mutual-funds",
    require("./routers/mutual-fund")(navDB.MutualFund, fundSearch)
  );
  app.use("/user", require("./routers/user")(navDB.MutualFund));

  app.listen(Config.port, Config.ip);
  console.log(`Server is listening on ${Config.ip}:${Config.port}`);
})();
