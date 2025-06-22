import joi from "joi"
import { generalFields } from "../../middleware/validation.middleware.js"
import e from "cors"

export const signup = joi.object().keys({
    username: generalFields.username.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
})

export const confirmEmail = joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required()
})


export const login = joi.object().keys({
    email: generalFields.email.required(),
    password: generalFields.password.required()
})


export const refreshToken = joi.object().keys({
    authorization: generalFields.authorization
})


export const forgotPassword = joi.object().keys({
    email: generalFields.email.required()
})


export const validateForgotPassword = confirmEmail

export const resetPassword = joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
})

export const enableTwoStepVerification = joi.object().keys({

})

export const verifyEnableTwoStepVerification = joi.object().keys({
    code: generalFields.code.required()
})

export const twoStepVerification = joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required()
})