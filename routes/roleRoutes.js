const router = require("express").Router();
const roleController = require("../controllers/roleController");
const verifyJWT = require("../middleware/verifyJWT");
router.use(verifyJWT);
router.route("/")
    .post(roleController.createRole)
    .get(roleController.getAllRoles);

module.exports = router;