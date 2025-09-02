const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Database connection successful");
  } catch (err) {
    console.error("❌ Database connection failed");
    console.error(err.message);
    process.exit(1);
  }


  
};
