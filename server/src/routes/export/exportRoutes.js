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

module.exports = router;
