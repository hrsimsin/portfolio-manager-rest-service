const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { $type: String, required: true, unique: true },
    password: { $type: String, required: true },
    name: { $type: String, required: true },
    transactions: [
      {
        "Scheme Code": String,
        schemeTransactions: [
          {
            type: String,
            navDate: String,
            nav: String,
            units: Number,
          },
        ],
      },
    ],
  },
  { typeKey: "$type" }
);

module.exports = mongoose.model("User", userSchema);
