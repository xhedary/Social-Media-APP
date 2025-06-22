import { Router } from "express";
import { } from "./services/user.service.js";
import { authentication, authorization } from "../../middleware/auth.middlware.js";
import * as userService from "./services/user.service.js";
import * as validators from "./user.validation.js"
import { validation } from "../../middleware/validation.middleware.js";
import { fileValidation } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { endpoint } from "./user.authorization.js";

const router = Router();
// Admin routes
router.get("/profile/dashboard", authentication(), authorization(endpoint.dashboard), userService.dashboard);
router.patch("/:userId/profile/dashboard/role", authentication(), authorization(endpoint.changeRole), userService.changeRole);



// Friend routes
router.patch(
    "/profile/freinds/:friendId",
    authentication(),
    userService.sendFriendRequest
);
router.patch(
    "/profile/freinds/:friendRequestId/accept"
    , authentication(),
    userService.acceptFriendRequest
);


router.get("/profile",
    authentication(),
    userService.profile
);
router.patch("/profile",
    authentication(),
    validation(validators.updateProfile),
    userService.updateProfile
);
router.patch("/profile/password",
    authentication(),
    userService.updatePassword
);

router.get(
    "/profile/:profileId",
    authentication(),
    userService.shareProfile
);

router.patch(
    "/profile/image",
    authentication(),
    uploadCloudFile(fileValidation.image).single("attachment"),
    validation(validators.profileImage),
    userService.updateProfileImage
);

router.patch(
    "/profile/image/cover",
    authentication(),
    uploadCloudFile(fileValidation.image).array("attachment", 2),
    userService.updateProfileCoverImage
);

export default router;
