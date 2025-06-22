import jwt from "jsonwebtoken"
import * as dbService from "../../DB/db.service.js"
import userModel from "../../DB/model/User.model.js"

export const tokenTypes = { access: "access", refresh: "refresh" }

export const decodedToken = async ({ authorization = "", tokenType = tokenTypes.access, next = {} } = {}) => {
    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        return next(new Error("In-valid token parts", { cause: 401 }))
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
        return next(new Error("In-valid token payload", { cause: 401 }))
    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted : {$exists: false} } })
    if (!user) {
        return next(new Error("Not register account", { cause: 404 }))
    }
    if (user.changeCredentialTime?.getTime() > decoded.iat * 1000) {
        return next(new Error("In-valid login credentials", { cause: 404 }))
    }
    return user
}


export const generateToken = ({ payload = {}, signature = process.env.USER_ACCESS_TOKEN, expiresIn = parseInt(process.env.ACCESS_EXPIRESIN) } = {}) => {
    const token = jwt.sign(payload, signature, { expiresIn })
    return token
}
export const verifyToken = ({ token, signature = process.env.USER_ACCESS_TOKEN } = {}) => {
    const decoded = jwt.verify(token, signature)
    return decoded
}