import userModel from "../../../DB/model/User.model.js"
import { emailEvent } from "../../../utils/event/email.event.js"
import { asyncHandler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js"
import { compareHash, generateHash } from "../../../utils/security/hash.security.js"
import * as dbService from "../../../DB/db.service.js"

export const signup = asyncHandler(
    async (req, res, next) => {
        const { username, email, password } = req.body
        if (await dbService.findOne({ model: userModel, filter: { email } })) {
            return next(new Error("Emial exist", { cause: 409 }))
        }
        const user = await dbService.create({ model: userModel, data: { username, email, password } })
        emailEvent.emit("sendConfirmEmail", { email })
        successResponse({ res, message: "Done", status: 201, data: user })
    }
)
export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { email, code } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("In-valid Account", { cause: 409 }))
        }
        if (user.confirmEmail) {
            return next(new Error("Already Confirmed", { cause: 409 }))
        }
        if (!compareHash({ plainText: code, hashValue: user.confirmEmailOTP })) {
            return next(new Error("In-valid Code", { cause: 400 }))
        }
        await dbService.updateOne({
            model: userModel,
            filter: email,
            data: {
                confirmEmail: true,
                $unset: { confirmEmailOTP: 0 }
            }
        })
        successResponse({ res, message: "Done", status: 201, data: user })
    }
)