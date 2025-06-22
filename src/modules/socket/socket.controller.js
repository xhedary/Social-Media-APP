
import { Server } from "socket.io"
import { disconnectSocket, registerSocket } from "./service/auth.service.js"
import { sendMessage } from "./service/message.service.js"

let io = undefined
export const runIo = (httpServer) => {
    io = new Server(httpServer, { cors: { origin: "*" } })
    return io.on("connection", async (socket) => {
        await registerSocket(socket)
        await sendMessage(socket)
        await disconnectSocket(socket)
    })
}

export const getIo = () => io