// Simulate the exact export flow used in exportController.js
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  require("./src/models/tag.model");
  const Company = require("./src/models/company.model");
  const exportService = require("./src/services/exportService");
  
  const companies = await Company.find({ company_name: /Manhattan/i }).populate("tags").lean();
  
  console.log("Found", companies.length, "companies");
  
  // Exact same selectedColumns as if ALL columns are selected  
  const selectedColumns = ["Company Name","Website","Industry","Email","Phone","City","Country","Tags","Description","Employee Contacts","Social Media Links","Source"];
  
  const rows = companies.map(c => {
    const row = {};
    const addField = (colName, value) => {
      if (!selectedColumns || selectedColumns.includes(colName) || colName === "Employee Contacts" || colName === "Social Media Links") {
        row[colName] = value;
      }
    };

    addField("Company Name", c.company_name || "");
    addField("Website", c.website || "");
    addField("Email", c.email || "");
    addField("Phone", c.phone || "");
    addField("City", c.city || "");
    addField("Country", c.country || "");
    addField("Industry", c.industry || "");
    addField("Tags", c.tags ? c.tags.map(t => t.name).join(", ") : "");
    addField("Description", c.description || "");
    
    // Employee Contacts
    const contactsFormatted = Array.isArray(c.contacts) && c.contacts.length > 0
      ? c.contacts.map(ct => `${ct.name || ''}${ct.email ? ` <${ct.email}>` : ''}${ct.contactNumber ? ` (${ct.contactNumber})` : ''}`.trim()).filter(Boolean).join(' | ')
      : "No Contacts";
    addField("Employee Contacts", contactsFormatted);

    // Social Media Links
    const social = c.socialMedia || {};
    const socialParts = [];
    Object.keys(social).forEach(platform => {
      const arr = social[platform] || [];
      if (Array.isArray(arr) && arr.length > 0) {
        const items = arr.map(it => {
          const u = it && (it.url || it.link) ? it.url || it.link : (typeof it === 'string' ? it : '');
          const name = it && it.username ? it.username : '';
          return name ? `${name} (${u})` : `${u}`;
        }).filter(Boolean).join('; ');
        if (items) socialParts.push(`${platform}: ${items}`);
      }
    });
    addField("Social Media Links", socialParts.length > 0 ? socialParts.join(' | ') : "No Links");
    addField("Source", c.source || "");

    return row;
  });

  console.log("\n=== First row keys ===");
  console.log(Object.keys(rows[0]));
  
  console.log("\n=== Employee Contacts value ===");
  console.log(rows[0]["Employee Contacts"]);
  
  console.log("\n=== Social Media Links value ===");
  console.log(rows[0]["Social Media Links"]);
  
  // Now generate the actual excel file
  let headers = selectedColumns;
  if (headers && !headers.includes("Employee Contacts")) headers.push("Employee Contacts");
  if (headers && !headers.includes("Social Media Links")) headers.push("Social Media Links");
  
  console.log("\n=== Headers ===");
  console.log(headers);
  
  const outPath = exportService.exportToExcel(rows, "debug_export.xlsx", headers);
  console.log("\n=== Exported to ===");
  console.log(outPath);
  
  // Read it back and verify
  const xlsx = require("xlsx");
  const fs = require("fs");
  const wb = xlsx.read(fs.readFileSync(outPath));
  const ws = wb.Sheets["Sheet1"];
  console.log("\n=== Read back CSV ===");
  console.log(xlsx.utils.sheet_to_csv(ws));
  
  process.exit(0);
}).catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
