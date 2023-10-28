const router = require("express").Router();
const roleController = require("../controllers/roleController");
router.route("/")
    .post(roleController.createRole)
    .get(roleController.getAllRoles);

module.exports = router;