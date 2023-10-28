const router = require("express").Router();
const communityController = require("../controllers/communityController");
const verifyJWT = require("../middleware/verifyJWT");
router.use(verifyJWT)

router.get("/me/member", communityController.getCommunitiesIjoined);
router.route("/")
    .get(communityController.getAllCommunities)
    .post(communityController.createCommunity)
router.get("/:id/members", communityController.getMembers);
router.delete("/:id", communityController.deleteCommunity);
router.get("/me/owner", communityController.getMyCommunities);
module.exports = router;


