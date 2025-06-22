
import * as postService from "./services/post.service.js"
import * as validators from "./post.validation.js"
import { authentication, authorization } from "../../middleware/auth.middlware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { Router } from "express";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { fileValidation } from "../../utils/multer/local.multer.js";
import { endPoint } from "./post.authorization.js";
import commentController from "../comment/comment.controller.js";

const router = Router();

router.use("/:postId/comment", commentController)
router.get("/posts",
    postService.getPosts)

router.post("/create", 
    authentication(), 
    authorization(endPoint.createPost),
    uploadCloudFile(fileValidation.image).array("attachment", 2),  
    validation(validators.createPost), 
    postService.createPost);
    
router.patch("/update/:postId", 
    authentication(), 
    authorization(endPoint.createPost),
    uploadCloudFile(fileValidation.image).array("attachment", 2),  
    validation(validators.updatePost), 
    postService.updatePost);

router.delete("/delete/:postId", 
    authentication(), 
    authorization(endPoint.freezePost),
    validation(validators.freezePost), 
    postService.freezePost);

router.patch("/unfreeze/:postId", 
    authentication(), 
    authorization(endPoint.freezePost),
    validation(validators.unfreezePost), 
    postService.unfreezePost);  
    
router.patch("/:postId/like", 
    authentication(), 
    authorization(endPoint.likePost),
    validation(validators.likePost), 
    postService.likePost);  


router
export default router

