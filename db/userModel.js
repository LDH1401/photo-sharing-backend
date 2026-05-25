const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  login_name: { type: String, unique: true, sparse: true },
  password: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
});

module.exports = mongoose.models.Users || mongoose.model("Users", userSchema);
