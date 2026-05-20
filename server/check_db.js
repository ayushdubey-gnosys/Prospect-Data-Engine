const mongoose = require("mongoose");
require("dotenv").config();

async function fixIndexes() {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");

    const Company = require("./src/models/company.model");
    
    // Drop existing indexes
    try {
      console.log("Dropping index fileId_1_email_1...");
      await Company.collection.dropIndex("fileId_1_email_1");
      console.log("Dropped fileId_1_email_1 successfully.");
    } catch (e) {
      console.log("Index fileId_1_email_1 could not be dropped or does not exist:", e.message);
    }

    try {
      console.log("Dropping index fileId_1_phone_1...");
      await Company.collection.dropIndex("fileId_1_phone_1");
      console.log("Dropped fileId_1_phone_1 successfully.");
    } catch (e) {
      console.log("Index fileId_1_phone_1 could not be dropped or does not exist:", e.message);
    }

    console.log("Verifying current indexes:");
    const indexes = await Company.collection.indexes();
    console.log("Indexes after drop:", JSON.stringify(indexes, null, 2));

  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixIndexes();
