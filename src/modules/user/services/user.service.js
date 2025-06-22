import userModel, { roleTypes } from "../../../DB/model/User.model.js"
import { asyncHandler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js"
import * as dbService from "../../../DB/db.service.js"
import { cloud } from "../../../utils/multer/cloudinary.multer.js"
import postModel from "../../../DB/model/Post.model.js"
import freindRequestModel, { freindRequestStatus } from "../../../DB/model/FreindRequest.model.js"


export const dashboard = asyncHandler(
    async (req, res, next) => {
        // const users = await dbService.find({ model: userModel })
        // const posts = await dbService.find({ model: postModel })

        const result = await Promise.allSettled([await dbService.find({
            model: postModel,
            populate: [{ path: "createdBy", select: "username image" }, { path: "likes", select: "username image" }]
        }), await dbService.find({ model: postModel })])
        successResponse({ res, data: result })
    }
)

export const changeRole = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params
        const { role } = req.body
        const roles = req.user.role === roleTypes.superAdmin ? { role: { $nin: [roleTypes.superAdmin] } } :
            { role: { $nin: [roleTypes.superAdmin, roleTypes.admin] } }
        const user = await dbService.findOneAndUpdate({
            model: userModel,
            filter: {
                _id: userId,
                ...roles
            },
            data: { role, updatedBy: req.user._id },
            options: { new: true }
        })
        successResponse({ res, data: user })
    }
)
export const profile = asyncHandler(
    async (req, res, next) => {
        const user = await dbService.findOne({
            model: userModel,
            filter: { _id: req.user._id },
            populate: [{
                path: "viewers",
                select: "username image"
            },
            {
                path: "friends",
                select: "username image"
            }]
        })
        successResponse({ res, data: user })
    }
)

export const updateProfile = asyncHandler(
    async (req, res, next) => {
        const user = await dbService.updateOne({
            model: userModel,
            filter: { _id: req.user._id },
            data: req.body,
            options: { new: true }
        })
        successResponse({ res, data: user })
    }
)

export const updateProfileImage = asyncHandler(
    async (req, res, next) => {
        const { public_id, secure_url } = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/users/${req.user._id}/profile` })
        const user = await dbService.findOneAndUpdate({
            model: userModel,
            filter: { _id: req.user._id },
            data: { image: { public_id, secure_url } },
            options: { new: false }
        })
        if (user.image?.public_id) {
            await cloud.uploader.destroy(user.image.public_id)
        }
        return successResponse({ res, data: user })
    }
)

export const updateProfileCoverImage = asyncHandler(
    async (req, res, next) => {
        const { public_id, secure_url } = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/users/${req.user._id}/cover` })
        const user = await dbService.findOneAndUpdate({
            model: userModel,
            filter: { _id: req.user._id },
            data: { cover: { public_id, secure_url } },
            options: { new: false }
        })
        successResponse({ res, data: user })
    }
)
export const shareProfile = asyncHandler(
    async (req, res, next) => {
        const { profileId } = req.params
        let resUser = null
        if (profileId === req.user._id.toString()) {
            resUser = req.user
        }
        else {
            let user = await dbService.findById({
                model: userModel,
                id: profileId,
                select: "username email image coverImages viewers gender friends DOB",
                populate: [{ path: "friends", select: "username image" }]
            })
            if (!user) {
                return next(new Error("In-valid Account ID", { cause: 404 }))
            }
            const visitorIndex = user.viewers.findIndex(viewer => viewer.userId.toString() === req.user._id.toString());
            if (visitorIndex !== -1) {
                user.viewers[visitorIndex].times.push(new Date());
                user.viewers[visitorIndex].times = user.viewers[visitorIndex].times.slice(-5) // last 5 times view
            } else {
                user.viewers.push({
                    userId: req.user._id,
                    times: [new Date()]
                })
            }
            await user.save()
            // remove viewer password

            resUser = {
                ...user._doc,
                password: undefined,
                __v: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                viewers: undefined
            }
        }
        successResponse({ res, data: resUser })
    }
)

export const updatePassword = asyncHandler(
    async (req, res, next) => {
        const { oldPassword, password } = req.body
        if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
            return next(new Error("In-valid old password", { cause: 400 }))
        }
        await dbService.updateOne({
            model: userModel,
            filter: { _id: req.user._id },
            data: {
                password: generateHash({ plainText: password }),
                changeCredentialTime: Date.now(),
            }
        })
        successResponse({ res, message: "Updated Password" })
    }
)

export const sendFriendRequest = asyncHandler(
    async (req, res, next) => {
        const { friendId } = req.params
        const checkUser = await dbService.findOne({ model: userModel, filter: { _id: friendId } })
        if (!checkUser) {
            return next(new Error("In-valid Account ID", { cause: 404 }))
        }
        const result = await Promise.allSettled([
            dbService.updateOne({
                model: userModel,
                filter: { _id: friendId },
                data: { $addToSet: { friendRequests: req.user._id } }
            }),
            dbService.updateOne({
                model: userModel,
                filter: { _id: req.user._id },
                data: { $addToSet: { friendRequests: friendId } }
            })
        ])
        const request = await dbService.create({
            model: freindRequestModel,
            data: {
                sender: req.user._id,
                receiver: friendId
            }
        })
        successResponse({ res, message: "Sent Friend Request", data: { request } })
    }
)

export const acceptFriendRequest = asyncHandler(
    async (req, res, next) => {
        const { friendRequestId } = req.params
        console.log(friendRequestId);
        const friendRequest = await dbService.findOne({
            model: freindRequestModel,
            filter: {
                _id: friendRequestId,
                receiver: req.user._id,
                status: freindRequestStatus.pending
            }
        })
        if (!friendRequest) {
            return next(new Error("In-valid Friend Request ID", { cause: 404 }))
        }


        const user1 = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: { $addToSet: { friends: friendRequest.sender }, $pull: { friendRequests: friendRequest.sender } },
            options: { new: true }
        })


        const user2 = await dbService.findByIdAndUpdate({
            model: userModel,
            id: friendRequest.sender,
            data: { $addToSet: { friends: req.user._id }, $pull: { friendRequests: req.user._id } },
            options: { new: true }

        })

        await dbService.findByIdAndDelete({
            model: freindRequestModel,
            id: friendRequestId
        })
        successResponse({ res, data: { friendRequest, user1, user2 } })
    }
) 
