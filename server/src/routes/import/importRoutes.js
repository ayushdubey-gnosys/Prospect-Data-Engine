const express = require("express");

const { importCSV, getHistory } = require("../../controllers/import/importController");
const { uploadHandler } = require("../../controllers/import/uploadController");
const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/csv", protect, authorize("admin", "sales"), importCSV);

router.get("/history", protect, authorize("admin", "sales"), getHistory);

// Upload endpoint: accepts file form-data under field name `file`
router.post("/upload", protect, authorize("admin", "sales"), uploadHandler);

module.exports = router;