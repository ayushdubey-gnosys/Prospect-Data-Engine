const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

// Simulate what the export controller does
const rows = [
  {
    "Company Name": "Manhattan Realty Group",
    "Website": "http://www.mrgnyc.com",
    "Email": "info@mrgnyc.com",
    "Phone": "+1 212-470-7070",
    "City": "Bhopal",
    "Country": "India",
    "Industry": "",
    "Tags": "",
    "Description": "bahut achi",
    "Employee Contacts": "Raju <raju@gmail.com> (+1 212-470-7071) | vijay <vijay@gmail.com> (7845126523)",
    "Social Media Links": "facebook: Raju Bhai (https://facebook.com/novatechsolutions) | youtube: Raju youtube (https://youtube.com/@NovaTechSolutions)",
    "Source": "excel"
  }
];

// Test 1: No headers option
console.log("=== TEST 1: No headers ===");
const ws1 = xlsx.utils.json_to_sheet(rows);
console.log(xlsx.utils.sheet_to_csv(ws1));
console.log("");

// Test 2: With headers option (like the code does)
const headers = ["Company Name","Website","Email","Phone","City","Country","Industry","Tags","Description","Employee Contacts","Social Media Links","Source"];
console.log("=== TEST 2: With headers option ===");
const ws2 = xlsx.utils.json_to_sheet(rows, { header: headers });
console.log(xlsx.utils.sheet_to_csv(ws2));
console.log("");

// Test 3: Write actual xlsx and check
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws2, "Sheet1");
const outPath = path.join(__dirname, "test_output.xlsx");
xlsx.writeFile(wb, outPath);
console.log("Written to:", outPath);

// Test 4: Read back and check headers
const wb2 = xlsx.read(fs.readFileSync(outPath));
const ws3 = wb2.Sheets["Sheet1"];
console.log("\n=== TEST 4: Read back from file ===");
console.log(xlsx.utils.sheet_to_csv(ws3));
