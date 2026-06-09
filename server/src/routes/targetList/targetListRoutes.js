const express = require("express");
const { protect, authorize } = require("../../middleware/authMiddleware");
const {
  createTargetList,
  getTargetLists,
  getTargetListById,
  repopulateTargetList,
  deleteTargetList,
  assignTargetList,
} = require("../../controllers/targetList/targetListController");

const router = express.Router();

router.use(protect);

// Get lists: allow admin and sales
router.get("/", authorize("admin", "sales"), getTargetLists);
router.get("/:id", authorize("admin", "sales"), getTargetListById);

// Manage lists: allow only admin
router.post("/", authorize("admin"), createTargetList);
router.post("/:id/repopulate", authorize("admin"), repopulateTargetList);
router.delete("/:id", authorize("admin"), deleteTargetList);
router.post("/:id/assign", authorize("admin"), assignTargetList);

module.exports = router;
