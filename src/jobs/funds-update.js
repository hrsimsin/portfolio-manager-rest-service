const getFundUpdateJob = (navDB, fundSearch) => {
  return async () => {
    await navDB.updateDB();
    const funds = await navDB.MutualFund.find({}, ["Scheme Name"]);
    fundSearch.addAll(funds);
  };
};

module.exports = getFundUpdateJob;
