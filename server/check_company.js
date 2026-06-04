// Check what actual data comes from MongoDB for Manhattan Realty Group
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Company = require("./src/models/company.model");
  
  const company = await Company.findOne({ company_name: /Manhattan/i }).lean();
  
  if (!company) {
    console.log("Company not found!");
    process.exit(1);
  }
  
  console.log("=== Company Name ===");
  console.log(company.company_name);
  
  console.log("\n=== contacts field ===");
  console.log(JSON.stringify(company.contacts, null, 2));
  
  console.log("\n=== socialMedia field ===");
  console.log(JSON.stringify(company.socialMedia, null, 2));
  
  console.log("\n=== All top-level keys ===");
  console.log(Object.keys(company));
  
  process.exit(0);
}).catch(err => {
  console.error("Connection error:", err.message);
  process.exit(1);
});
