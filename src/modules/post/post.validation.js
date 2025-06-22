import joi from "joi"
import { generalFields } from "../../middleware/validation.middleware.js"

export const createPost = joi.object().keys({
    content : joi.string().min(2).max(50000).trim(),
    file : joi.array().items(generalFields.file),
}).or("content", "file")

export const updatePost = joi.object().keys({
    content : joi.string().min(2).max(50000).trim(),
    file : joi.array().items(generalFields.file),
    postId : generalFields.id.required()
}).or("content", "file")

export const freezePost = joi.object().keys({
    postId : generalFields.id.required()
})

export const unfreezePost = freezePost

export const likePost = joi.object().keys({
    postId : generalFields.id.required(),
    action : joi.string().valid("like" , "unlike")
})

export const likePostGraph = joi.object().keys({
    postId : generalFields.id.required(),
    action : joi.string().valid("like" , "unlike"),
    authorization : joi.string().pattern(new RegExp(/^(Bearer|System) [A-Za-z0-9\-\._~\+\/]+=*$/))
})


