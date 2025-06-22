import { verifyToken , tokenTypes } from "../../utils/security/token.js"
import * as dbService from "../../DB/db.service.js"
import userModel from "../../DB/model/User.model.js";

export const authentication = async ({
    authorization = "", 
    tokenType = tokenTypes.access
} = {}, accessRole = [], checkAuthorization = false) => {
    const [bearer, token] = authorization?.split(" ") || []
    
    if (!bearer || !token) {
        throw new Error("In-valid token parts", { cause: 401 })
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
        throw new Error("In-valid token payload")
    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted : {$exists: false} } })
    if (!user) {
        throw new Error("Not register account")
    }
    if (user.changeCredentialTime?.getTime() > decoded.iat * 1000) {
        throw new Error("In-valid login credentials")
    }

    if(checkAuthorization && !accessRole.includes(user.role)) {
        throw new Error("unauthorized account")
    }
    return user
}


