const express = require("express");
const { getAllUsers, updateUser, deleteUser } = require("../../controllers/user/userController");
const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

// All routes here are restricted to logged-in admins
router.use(protect, authorize("admin"));

router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
