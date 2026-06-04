const express = require("express");
const { protect, authorize } = require("../../middleware/authMiddleware");
const {
  createTargetList,
  getTargetLists,
  getTargetListById,
  repopulateTargetList,
  deleteTargetList,
} = require("../../controllers/targetList/targetListController");

const router = express.Router();

// Only admins can manage target lists
router.use(protect);
router.use(authorize("admin"));

router.post("/", createTargetList);
router.get("/", getTargetLists);
router.get("/:id", getTargetListById);
router.post("/:id/repopulate", repopulateTargetList);
router.delete("/:id", deleteTargetList);

module.exports = router;
