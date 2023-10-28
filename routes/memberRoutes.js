const router = require("express").Router();
const memberController = require("../controllers/memberController");
const verifyJWT = require("../middleware/verifyJWT");
router.use(verifyJWT);

router.post("/", memberController.createMember);
router.delete("/:id", memberController.deleteMember);
module.exports = router;
