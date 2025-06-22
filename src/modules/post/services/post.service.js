import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import postModel from "../../../DB/model/Post.model.js";
import * as dbService from "../../../DB/db.service.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { roleTypes } from "../../../DB/model/User.model.js";
import commentModel from "../../../DB/model/Comment.model.js";

export const getPosts = asyncHandler(
    async (req, res, next) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit
        const size = await dbService.count({ model: postModel, filter: { isDeleted: { $exists: false } } })

        const results = await dbService.find({
            model: postModel,
            filter: { isDeleted: { $exists: false } },
            populate: [
                {
                    path: "createdBy",
                    select: "username image"
                },
                {
                    path: "likes",
                    select: "username image"
                },
                {
                    path: "comments",
                    match: { isDeleted: { $exists: false }, commentId: { $exists: false } },
                    populate: [{
                        path: "createdBy",
                        select: "username image",
                    },
                    {
                        path: "replies",
                        match: { isDeleted: { $exists: false } },
                        populate: [{
                            path: "createdBy",
                            select: "username image",
                        }]
                    }
                    
                ]
                }],
                skip,
                limit
        })
        successResponse({ res, data: { results, page, limit, size } })
    }
)
export const createPost = asyncHandler(
    async (req, res, next) => {
        const { content } = req.body
        let attachments = []
        for (const file of req.files) {
            const { public_id, secure_url } = await cloud.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/posts/${req.user._id}` })
            attachments.push({ public_id, secure_url })
        }
        const post = await dbService.create({
            model: postModel,
            data: { content, attachments, createdBy: req.user._id }
        })
        successResponse({ res, data: { post } })
    }
)
export const updatePost = asyncHandler(
    async (req, res, next) => {
        const { content } = req.body
        let attachments = []
        if (req.files?.length) {
            for (const file of req.files) {
                const { public_id, secure_url } = await cloud.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/posts/${req.user._id}` })
                attachments.push({ public_id, secure_url })
            }
            req.body.attachments = attachments
        }

        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: { _id: req.params.postId, createdBy: req.user._id, isDeleted: { $exists: false } },
            data: {
                ...req.body,
                updatedBy: req.user._id
            },
            options: { new: false }
        })
        for (const attachment of post.attachments) {
            if (attachment.public_id) {
                await cloud.uploader.destroy(attachment.public_id)
            }
        }
        return post ? successResponse({ res, data: { post } }) : next(new Error("In-valid post id", { cause: 400 }))
    }
)
export const freezePost = asyncHandler(
    async (req, res, next) => {
        const owner = req.user.role === roleTypes.admin ? {} : { createdBy: req.user._id }
        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: req.params.postId,
                isDeleted: { $exists: false },
                ...owner
            },
            data: {
                isDeleted: Date.now(),
                deletedBy: req.user._id,
                updatedBy: req.user._id
            },
            options: { new: true }
        })
        return post ? successResponse({ res, data: { post } }) : next(new Error("In-valid post id", { cause: 400 }))
    }
)

export const unfreezePost = asyncHandler(
    async (req, res, next) => {
        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: req.params.postId,
                isDeleted: { $exists: true },
                deletedBy: req.user._id
            },
            data: {
                $unset: { isDeleted: 0, deletedBy: 0 },
                updatedBy: req.user._id
            },
            options: { new: true }
        })
        return post ? successResponse({ res, data: { post } }) : next(new Error("In-valid post id", { cause: 400 }))
    }
)


export const likePost = asyncHandler(
    async (req, res, next) => {
        console.log(req.query);

        const data = req.query.action === "unlike" ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }
        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: req.params.postId,
                isDeleted: { $exists: false }
            },
            data,
            options: { new: true }
        })
        return post ? successResponse({ res, data: { post } }) : next(new Error("In-valid post idd", { cause: 400 }))
    }
)







