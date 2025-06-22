import { EventEmitter } from "node:events";
import { sendMail } from "../email/sendCode.js";
import { customAlphabet } from "nanoid";
import { generateHash } from "../security/hash.security.js";
import userModel from "../../DB/model/User.model.js";
import { confirmEmailTemplate } from "../email/template/confirmEmail.template.js";
export const emailEvent = new EventEmitter()
import * as dbService from "../../DB/db.service.js"
import e from "cors";



export const emailSubject = {
    confirmEmail: "Confirm-Email",
    resetPassword: "Reset-password",
    twoStepVerification : "Two-Step-Verification",
    enableTwoStepVerification : "Enable-Two-Step-Verification"
}
export const sendCode = async ({ data = {}, subject = emailSubject.confirmEmail, } = {}) => {
    const { email } = data
    const otp = customAlphabet('0123456789', 4)()
    console.log(otp);
    const hashOtp = generateHash({ plainText: otp })
    let updateData = {}
    switch (subject) {
        case emailSubject.confirmEmail:
            updateData = { confirmEmailOTP: hashOtp }
            break;
        case emailSubject.resetPassword:
            updateData = { resetPasswordOTP: hashOtp }
            break;
        case emailSubject.twoStepVerification:
        case emailSubject.enableTwoStepVerification:
            updateData = { twoStepVerificationOTP: hashOtp }
            break;
        default:
            break;
    }
    await dbService.updateOne({ model: userModel, filter: {email}, data: updateData })
    const html = confirmEmailTemplate({ code: otp })
    sendMail({ to: email, subject: subject, html })
}
emailEvent.on("sendConfirmEmail", async (data) => {
    sendCode({ data })
})
emailEvent.on("resetPassword", async (data) => {
    sendCode({ data, subject: emailSubject.resetPassword })
})
emailEvent.on("enableTwoStepVerification", async (data) => {
    sendCode({ data, subject: emailSubject.enableTwoStepVerification })
})
emailEvent.on("twoStepVerification", async (data) => {
    sendCode({ data, subject: emailSubject.twoStepVerification })
})