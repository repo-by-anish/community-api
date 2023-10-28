const router = require("express").Router();
const userController = require("../controllers/userController")
const verifyJWT = require("../middleware/verifyJWT")
router.use(verifyJWT);
router.get("/", userController.getAllUsers)
module.exports = router