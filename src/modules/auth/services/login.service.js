import userModel, { roleTypes } from "../../../DB/model/User.model.js"
import { emailEvent } from "../../../utils/event/email.event.js"
import { asyncHandler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js"
import { compareHash, generateHash } from "../../../utils/security/hash.security.js"
import { decodedToken, generateToken, tokenTypes } from "../../../utils/security/token.js"
import * as dbService from "../../../DB/db.service.js"
import { OAuth2Client } from "google-auth-library"
import { providerTypes } from "../../../DB/model/User.model.js"
import logger from "../../../utils/logger/logger.js"




export const login = asyncHandler(
    async (req, res, next) => {
        logger.info("Login service started", { email: req.body.email });
        logger.warn("This is a warning message");
        const { email, password } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("In-valid email or password", { cause: 404 }))
        }
        if (!user.confirmEmail) {
            return next(new Error("Confirm your email first", { cause: 400 }))
        }
        if (!compareHash({ plainText: password, hashValue: user.password })) {
            logger.error("In-valid password", { email: req.body.email })
            return next(new Error("In-valid email or password", { cause: 404 }))
        }
        if (user.twoStepVerification) {
            emailEvent.emit("twoStepVerification", { email })
            return next(new Error("Two step verification is enabled", { cause: 200 }))
        }
        const access_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
            expiresIn: parseInt(process.env.ACCESS_EXPIRESIN)
        })
        const refresh_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            expiresIn: parseInt(process.env.REFRESH_EXPIRESIN)
        })
        successResponse({
            res, message: "Done", status: 200, data: {
                token: {
                    access_token,
                    refresh_token
                }
            }
        })
    }
)
export const loginWithGmail = asyncHandler(
    async (req, res, next) => {
        const { idToken } = req.body
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            return payload
        }
        verify()
        const payload = await verify()
        if (!payload.email_verified) {
            return next(new Error("In-valid account", { cause: 404 }))
        }
        let user = await dbService.findOne({ model: userModel, filter: { email: payload.email } })
        if (!user) {
            user = await dbService.create({
                model: userModel, data: {
                    username: payload.name,
                    email: payload.email,
                    confirmEmail: payload.email_verified,
                    img: payload.picture,
                    provider: providerTypes.google
                }
            })
        }

        if (user.provider !== providerTypes.google) {
            return next(new Error("In-valid provider", { cause: 400 }))
        }
        const access_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
            expiresIn: parseInt(process.env.ACCESS_EXPIRESIN)
        })
        const refresh_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            expiresIn: parseInt(process.env.REFRESH_EXPIRESIN)
        })
        successResponse({
            res, message: "Done", status: 201, data: {
                token: {
                    access_token,
                    refresh_token
                }
            }
        })
    }
)

export const refreshToken = asyncHandler(
    async (req, res, next) => {
        const { authorization } = req.headers
        const user = await decodedToken({ authorization, tokenType: tokenTypes.refresh, next })
        if (user) {
            const access_token = generateToken({
                payload: { id: user._id },
                signature: user.role === roleTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
                expiresIn: parseInt(process.env.ACCESS_EXPIRESIN)
            })
            const refresh_token = generateToken({
                payload: { id: user._id },
                signature: user.role === roleTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
                expiresIn: parseInt(process.env.REFRESH_EXPIRESIN)
            })
            successResponse({
                res, message: "Done", status: 200, data: {
                    token: {
                        access_token,
                        refresh_token
                    }
                }
            })
        }
    }
)

export const forgotPassword = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("In-valid Account", { cause: 404 }))
        }
        if (!user.confirmEmail) {
            return next(new Error("Confirm email first", { cause: 400 }))
        }
        emailEvent.emit("resetPassword", { email })
        successResponse({ res })
    }
)

export const validateForgotPassword = asyncHandler(
    async (req, res, next) => {
        const { email, code } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("In-valid Account", { cause: 404 }))
        }
        if (!user.confirmEmail) {
            return next(new Error("Confirm email first", { cause: 400 }))
        }
        if (user.lastAttemptCode?.getTime() + (5 * 60000) < Date.now()) {  // 5 minutes (60000 * 5) lastAttemptCode
            await dbService.updateOne({
                model: userModel,
                filter: { email },
                data: {
                    lastAttemptCode: Date.now(),
                    noOfAttemptCode: 0
                }, options: { new: true, runValidators: true }
            })
        }

        if (user.noOfAttemptCode >= 5 && user.lastAttemptCode?.getTime() + (5 * 60000) > Date.now()) // 5 minutes (60000 * 5) lastAttemptCode) 
        {
            return next(new Error(`Too many attempts please try again after ${(user.lastAttemptCode.getTime() + (5 * 60000) - Date.now()) / 1000 / 60}   minutes`, { cause: 400 }))
        }
        if (!compareHash({ plainText: code, hashValue: user.resetPasswordOTP })) {
            await dbService.updateOne({
                model: userModel,
                filter: { email },
                data: {
                    lastAttemptCode: Date.now(),
                    $inc: { noOfAttemptCode: 1 }
                }, options: { new: true, runValidators: true }
            })
            return next(new Error("In-valid code", { cause: 400 }))
        } else {
            await dbService.updateOne({
                model: userModel,
                filter: { email },
                data: {
                    $unset: { resetPasswordOTP: 0 },
                    lastAttemptCode: Date.now(),
                    noOfAttemptCode: 0
                }
            })
            successResponse({ res })
        }

    }
)
export const resetPassword = asyncHandler(
    async (req, res, next) => {
        const { email, code, password } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("In-valid Account", { cause: 404 }))
        }
        if (!user.confirmEmail) {
            return next(new Error("Confirm email first", { cause: 400 }))
        }
        if (user.lastAttemptCode?.getTime() + (5 * 60000) < Date.now()) {  // 5 minutes (60000 * 5) lastAttemptCode
            await dbService.updateOne({
                model: userModel,
                filter: { email },
                data: {
                    lastAttemptCode: Date.now(),
                    noOfAttemptCode: 0
                }, options: { new: true, runValidators: true }
            })
        }
        if (user.noOfAttemptCode >= 5 && user.lastAttemptCode?.getTime() + (5 * 60000) > Date.now()) // 5 minutes (60000 * 5) lastAttemptCode) 
        {
            return next(new Error("Too many attempts please try again later", { cause: 400 }))
        }
        if (!compareHash({ plainText: code, hashValue: user.resetPasswordOTP })) {
            await dbService.updateOne({
                model: userModel,
                filter: { email },
                data: {
                    lastAttemptCode: Date.now(),
                    $inc: { noOfAttemptCode: 1 }
                }, options: { new: true, runValidators: true }
            })
            return next(new Error("In-valid code", { cause: 400 }))
        } else {
            await dbService.updateOne({
                model: userModel,
                filter: { email },
                data: {
                    password: generateHash({ plainText: password }),
                    changeCredentialTime: Date.now(),
                    $unset: { resetPasswordOTP: 0 }
                }
            })
            successResponse({ res, message: "Updated Password" })
        }

    }
)


export const enableTwoStepVerification = asyncHandler(
    async (req, res, next) => {
        const { email } = req.user
        emailEvent.emit("enableTwoStepVerification", { email })
        successResponse({ res, message: "Done", status: 200 })
    }
)

export const verifyEnableTwoStepVerification = asyncHandler(
    async (req, res, next) => {
        const { email } = req.user
        const { code } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("In-valid Account", { cause: 404 }))
        }
        if (!user.confirmEmail) {
            return next(new Error("Confirm email first", { cause: 400 }))
        }
        console.log(user.twoStepVerificationOTP);

        if (!compareHash({ plainText: code, hashValue: user.twoStepVerificationOTP })) {
            return next(new Error("In-valid code", { cause: 400 }))
        }
        await dbService.updateOne({
            model: userModel,
            filter: { email },
            data: {
                $unset: { twoStepVerificationOTP: 0 },
                twoStepVerification: true
            }
        })
        successResponse({ res, message: "Done", status: 200 })
    }
)

export const twoStepVerification = asyncHandler(
    async (req, res, next) => {
        const { code, email } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!compareHash({ plainText: code, hashValue: user.twoStepVerificationOTP })) {
            return next(new Error("In-valid code", { cause: 400 }))
        }
        await dbService.updateOne({
            model: userModel,
            filter: { email },
            data: {
                $unset: { twoStepVerificationOTP: 0 }
            }
        })
        const access_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
            expiresIn: parseInt(process.env.ACCESS_EXPIRESIN)
        })
        const refresh_token = generateToken({
            payload: { id: user._id },
            signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            expiresIn: parseInt(process.env.REFRESH_EXPIRESIN)
        })
        successResponse({
            res, message: "Done", status: 200, data: {
                token: {
                    access_token,
                    refresh_token
                }
            }
        })
    }
)











