import joi from "joi"
import { generalFields } from "../../middleware/validation.middleware.js"

export const createComment = joi.object().keys({
    content : joi.string().min(2).max(50000).trim(),
    file : joi.array().items(generalFields.file),
    postId : generalFields.id.required(),
    commentId : generalFields.id
}).or("content", "file")

export const updateComment = joi.object().keys({
    content : joi.string().min(2).max(50000).trim(),
    file : joi.array().items(generalFields.file),
    postId : generalFields.id.required(),
    commentId : generalFields.id.required()
}).or("content", "file")

export const deleteComment = joi.object().keys({
    postId : generalFields.id.required(),
    commentId : generalFields.id.required()
}).required()

