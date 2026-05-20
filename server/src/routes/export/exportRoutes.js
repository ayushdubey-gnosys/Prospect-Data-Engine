const express = require("express");

const {
  exportCompanies,
  getExportHistory,
} = require("../../controllers/export/exportController");
const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/companies", protect, authorize("admin", "marketing"), exportCompanies);
router.get("/history", protect, authorize("admin", "marketing"), getExportHistory);

module.exports = router;