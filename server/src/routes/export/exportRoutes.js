const express = require("express");

const {
  exportCompanies,
  getExportHistory,
  regenerateExport,
  getRegenerateHistory,
} = require("../../controllers/export/exportController");
const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/companies", protect, authorize("admin", "marketing"), exportCompanies);
router.get("/history", protect, authorize("admin", "marketing"), getExportHistory);
router.post("/regenerate/:exportId", protect, authorize("admin", "marketing"), regenerateExport);
router.get("/regenerate-history/:exportId", protect, authorize("admin", "marketing"), getRegenerateHistory);

router.get("/test", (req, res) => {
  const xlsx = require("xlsx");
  const path = require("path");
  const rows = [
    { "Company Name": "Test 1", "Employee Contacts": "", "Social Media Links": "Has Links", "Source": "test" },
    { "Company Name": "Test 2", "Employee Contacts": "Has Contacts", "Social Media Links": "", "Source": "test" }
  ];
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows, { header: ["Company Name", "Employee Contacts", "Social Media Links", "Source"] });
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  const outPath = path.join(process.cwd(), "test_export.xlsx");
  xlsx.writeFile(wb, outPath);
  res.download(outPath);
});

module.exports = router;
