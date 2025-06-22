import chatModel from "../../../DB/model/Chat.model.js"
import { authentication } from "../../../middleware/socket/auth.middlware.js"
import * as dbService from "../../../DB/db.service.js"
import { socketConnections } from "../../../DB/model/User.model.js"

export const sendMessage = (socket) => {
    return socket.on("sendMessage", async (messageData) => {
        const { data, valid } = await authentication({ socket })
        if (!valid) {
            return socket.emit("socket_Error", data)
        }
        const userId = data.user._id
        const { message, destId } = messageData
        console.log({ userId, message, destId })

            let chat = await dbService.findOneAndUpdate({
                model: chatModel,
                filter: {
                    $or: [
                        {
                            mainUser: userId,
                            subParticipant: destId
                        },
                        {
                            mainUser: destId,
                            subParticipant: userId
                        }
                    ]
                },
                data : {
                    $push : {
                        messages : {
                            senderId : userId,
                            message
                        }
                    }
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

            if (!chat) {
                chat = await dbService.create({
                    model: chatModel,
                    data: {
                        mainUser: userId,
                        subParticipant: destId,
                        messages: [
                            {
                                message,
                                senderId: userId,
                            }
                        ]
                    }
                })
            }
            
            socket.emit("successMessage", {chat , message})

            socket.to(socketConnections.get(destId)).emit("receiveMessage", {chat , message})
            return "Done"
    })
}