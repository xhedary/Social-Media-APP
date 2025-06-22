import { Router } from "express";
import * as commentService from "./services/comment.service.js";
import { authentication, authorization } from "../../middleware/auth.middlware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./comment.validation.js"
import { fileValidation, uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { endPoint } from "./comment.authorization.js";

const router = Router({
    mergeParams: true
});

router.post("/:commentId?", 
    authentication(),
    authorization(endPoint.createComment),
    uploadCloudFile(fileValidation.image).array("attachment", 2),
    validation(validators.createComment),
    commentService.createComment)


    router.patch("/:commentId", 
    authentication(),
    authorization(endPoint.updateComment),
    uploadCloudFile(fileValidation.image).array("attachment", 2),
    validation(validators.updateComment),
    commentService.updateComment)

router.delete("/:commentId/freeze", 
    authentication(),
    authorization(endPoint.deleteComment),
    validation(validators.deleteComment),
    commentService.deleteComment)


router.patch("/:commentId/unfreeze",
    authentication(),
    authorization(endPoint.deleteComment),
    validation(validators.deleteComment),
    commentService.unfreezeComment
)
export default router