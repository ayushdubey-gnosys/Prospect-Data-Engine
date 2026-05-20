const express = require("express");
const { getCountries, getCities, getIndustries } = require("../../controllers/filters/filtersController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/countries", protect, getCountries);
router.get("/cities", protect, getCities);
router.get("/industries", protect, getIndustries);

module.exports = router;
