const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {
  if (!process.env.DB_URL) {
    console.error("Missing DB_URL environment variable.");
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_URL);
  console.log("Successfully connected to MongoDB Atlas!");
}

module.exports = dbConnect;
