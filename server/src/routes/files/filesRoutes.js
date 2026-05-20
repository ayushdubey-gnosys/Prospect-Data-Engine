const express = require("express");
const filesController = require("../../controllers/files/filesController");
const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, filesController.getAllFiles);

router.get("/:id/companies", protect, filesController.getFileCompanies);

router.get("/:id/cities", protect, filesController.getFileCities);

router.get("/:id/industries", protect, filesController.getFileIndustries);

router.get("/:id/countries", protect, filesController.getFileCountries);

router.get("/:id/export", protect, authorize("admin", "marketing"), filesController.filterAndExport);

module.exports = router;
