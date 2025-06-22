import { socketConnections } from "../../../DB/model/User.model.js"
import { authentication } from "../../../middleware/socket/auth.middlware.js"

export const registerSocket = async (socket) => {
    const { data, valid } = await authentication({ socket })
    if (!valid) {
        return socket.emit("socket_Error", data)
    }
    socketConnections.set(data.user._id.toString(), socket.id)
    console.log(`🟢 User connected with ${socket.id}`);
    console.log(socketConnections);
}

export const disconnectSocket = async (socket) => {
    socket.on("disconnect", async () => {
        const { data, valid } = await authentication({ socket })
        if (!valid) {
            return socket.emit("socket_Error", data)
        }
        socketConnections.delete(data.user._id.toString())
        console.log(`🔴 User disconnected with ${socket.id}`);
        console.log(socketConnections);
        return "done"
    })
}