const express = require("express");
const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const { loginValidator, changePasswordValidator } = require("../validators/authValidator");

const router = express.Router();

router.post("/login", loginValidator, validateRequest, authController.login);
router.get("/me", protect, authController.me);
router.put("/change-password", protect, changePasswordValidator, validateRequest, authController.changePassword);

module.exports = router;
