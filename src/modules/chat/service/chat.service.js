import { asyncHandler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js"
import chatModel from "../../../DB/model/Chat.model.js"
import * as dbService from "../../../DB/db.service.js"

export const getChat = asyncHandler(async (req, res) => {
    const { friendId } = req.params
    const chat = await dbService.findOne({
        model: chatModel,
        filter: {
            $or: [
                {
                    mainUser: req.user._id,
                    subParticipant: friendId
                },
                {
                    mainUser: friendId,
                    subParticipant: req.user._id
                }
            ]
        },
        populate: [
            {
                path: "mainUser",
                select: "username image"
            },
            {
                path: "subParticipant",
                select: "username image"
            },
            {
                path: "messages.senderId",
                select: "username image"
            }]
    })
    successResponse({ res, data: {chat} })
})