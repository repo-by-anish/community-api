const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const limiter = require("../middleware/liginLimiter");
const verifyJWT = require("../middleware/verifyJWT");

router.post("/signup", authController.register);
router.post("/signin", limiter, authController.login);
router.post("/signout", authController.logout);
router.get("/refresh", authController.refresh);
router.get("/me", verifyJWT, authController.getMe);

module.exports = router