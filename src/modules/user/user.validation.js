import { generalFields } from "../../middleware/validation.middleware.js";
import joi from "joi";

export const profile = {
    body: joi.object().keys({
    })
}
export const shareProfile = {
}

export const password = {
    body: joi.object().keys({
        oldPassword: generalFields.password.required(),
        profileId: generalFields.password.required()
    })
}

export const profileImage = joi.object().keys({
    file: generalFields.file.required()
})

export const updateProfile = joi.object().keys({
    username: generalFields.username,
    phone: generalFields.phone,
    DOB: generalFields.DOB,
    address: generalFields.address,
    gender: generalFields.gender
})
