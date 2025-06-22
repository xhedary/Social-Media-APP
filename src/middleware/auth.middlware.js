import { asyncHandler } from "../utils/response/error.response.js"
import { decodedToken, tokenTypes } from "../utils/security/token.js"

export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers
        req.user = await decodedToken({ authorization, next })
        return next()
    })
}

export const authorization = (accessRole = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!accessRole.includes(req.user.role)) {
            return next(new Error("unauthorized account", { cause: 403 }))
        }
        return next()
    })
}