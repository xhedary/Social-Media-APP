import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import commentModel from "../../../DB/model/Comment.model.js";
import * as dbService from "../../../DB/db.service.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import postModel from "../../../DB/model/Post.model.js";
import { roleTypes } from "../../../DB/model/User.model.js";


export const createComment = asyncHandler(
    async (req, res, next) => {
        const { postId , commentId} = req.params
        if(commentId && ! await dbService.findOne({
            model: commentModel,
            filter: {
                _id: commentId,
                isDeleted: { $exists: false }
            }
        })){
            return next(new Error("In-valid comment id", { cause: 400 }))
        }
        const post = await dbService.findOne({
            model: postModel,
            filter: {
                _id: postId,
                isDeleted: { $exists: false }
            }
        })
        if (!post) {
            return next(new Error("In-valid post id", { cause: 400 }))
        }

        if (req.files?.length) {
            let attachments = []
            for (const file of req.files) {
                const { public_id, secure_url } = await cloud.uploader.upload(file.path,
                    { folder: `${process.env.APP_NAME}/user/${post.createdBy}/post/${postId}/comment` })
                attachments.push({ public_id, secure_url })
            }
            req.body.attachments = attachments
        }

        const comment = await dbService.create({
            model: commentModel,
            data: {
                ...req.body,
                postId,
                commentId,
                createdBy: req.user._id,
                attachments: req.body.attachments
            }
        })
        return successResponse({ res, data: comment })
    }
)

export const updateComment = asyncHandler(
    async (req, res, next) => {
        const { postId, commentId } = req.params
        const comment = await dbService.findOne({
            model: commentModel,
            filter: {
                _id: commentId,
                postId,
                createdBy: req.user._id,
                isDeleted: { $exists: false }
            }, populate: [{
                path: "postId"
            }]
        })
        if (!comment || comment.postId.isDeleted) {
            return next(new Error("In-valid comment id", { cause: 400 }))
        }

        if (req.files?.length) {
            let attachments = []
            for (const file of req.files) {
                const { public_id, secure_url } = await cloud.uploader.upload(file.path,
                    { folder: `${process.env.APP_NAME}/user/${req.user._id}/post/${postId}/comment` })
                attachments.push({ public_id, secure_url })
            }
            req.body.attachments = attachments
        }

        const savedComment = await dbService.findOneAndUpdate({
            model: commentModel,
            filter: {
                _id: commentId,
                createdBy: req.user._id,
                isDeleted: { $exists: false }
            },
            data: {
                ...req.body,
                updatedBy: req.user._id
            },
            options: { new: true }
        })
        for (const attachment of comment.attachments) {
            if (attachment.public_id) {
                await cloud.uploader.destroy(attachment.public_id)
            }
        }
        return successResponse({ res, data: { comment: savedComment } })
    }
)

export const deleteComment = asyncHandler(
    async (req, res, next) => {
        const { postId, commentId } = req.params
        const comment = await dbService.findOne({
            model: commentModel,
            filter: {
                _id: commentId,
                postId,
                isDeleted: { $exists: false }
            }, populate: [{
                path: "postId"
            }]
        })
        if (!comment ||
            (
                comment.createdBy.toString() !== req.user._id.toString() &&
                comment.postId.createdBy.toString() !== req.user._id.toString() &&
                req.user.role != roleTypes.admin)
        ) {
            return next(new Error("In-valid comment id or not authorized", { cause: 400 }))
        }

        const savedComment = await dbService.findOneAndUpdate({
            model: commentModel,
            filter: {
                _id: commentId,
                postId,
                isDeleted: { $exists: false }
            },
            data: {
                isDeleted: Date.now(),
                deletedBy: req.user._id,
                updatedBy: req.user._id
            },
            options: { new: true }
        })
        return successResponse({ res, data: { comment: savedComment } })
    }
)
export const unfreezeComment = asyncHandler(
    async (req, res, next) => {
        const { postId, commentId } = req.params
        const comment = await dbService.findOne({
            model: commentModel,
            filter: {
                _id: commentId,
                postId,
                deletedBy: req.user._id,
                isDeleted: { $exists: true }
            }, populate: [{
                path: "postId"
            }]
        })
        if (!comment) {
            return next(new Error("In-valid comment id or not authorized", { cause: 400 }))
        }

        const savedComment = await dbService.findOneAndUpdate({
            model: commentModel,
            filter: {
                _id: commentId,
                postId,
                deletedBy: req.user._id,
                isDeleted: { $exists: true }
            },
            data: {
                $unset: { 
                    isDeleted: 0, 
                    deletedBy:  0
                },
                updatedBy: req.user._id
            },
            options: { new: true }
        })
        return successResponse({ res, data: { comment: savedComment } })
    }
)