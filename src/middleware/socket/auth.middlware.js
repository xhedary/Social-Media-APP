import { verifyToken , tokenTypes } from "../../utils/security/token.js"
import * as dbService from "../../DB/db.service.js"
import userModel from "../../DB/model/User.model.js";

export const authentication = async ({
    socket = {}, 
    tokenType = tokenTypes.access
} = {}, accessRole = [], checkAuthorization = false) => {
    const [bearer, token] = socket?.handshake?.auth?.authorization?.split(" ") || []
    
    if (!bearer || !token) {
        return {data : {message: "In-valid token parts", cause: 401}}
    }
    let access_signature = ''
    let refresh_signature = ''

    switch (bearer) {
        case "Bearer":
            refresh_signature = process.env.USER_REFRESH_TOKEN
            access_signature = process.env.USER_ACCESS_TOKEN
            break;
        case "System":
            refresh_signature = process.env.ADMIN_REFRESH_TOKEN
            access_signature = process.env.ADMIN_ACCESS_TOKEN
            break;
        default:
            break;
    }

    const decoded = verifyToken({ token, signature: tokenType == tokenTypes.access ? access_signature : refresh_signature })
    if (!decoded?.id) {
        return {data : {message: "In-valid token payload", cause: 401}}
    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted : {$exists: false} } })
    if (!user) {
        return {data : {message: "Not register account", cause: 404}}
    }
    if (user.changeCredentialTime?.getTime() > decoded.iat * 1000) {
        return {data : {message: "In-valid login credentials", cause: 401}}
    }

    if(checkAuthorization && !accessRole.includes(user.role)) {
        return {data : {message: "unauthorized account", cause: 403}}
    }
    return {data : {message: "Done", status : 200 , user} , valid : true}
    return user
}


