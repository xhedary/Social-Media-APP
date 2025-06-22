import joi from "joi"
import { Types } from "mongoose"

export const validationObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value)
        ? true : helper.message("In-valid Object Id")
}

const file = joi.object().keys({
    fieldname: joi.string().valid("attachment"),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    finalPath: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    path: joi.string(),
    size: joi.number()
})

export const generalFields = {
    username: joi.string().min(3).max(25).case("lower").trim(),
    email: joi.string().email(),
    password: joi.string(),
    confirmationPassword: joi.string().valid(joi.ref("password")),
    phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    DOB: joi.date().less("now"),
    address: joi.string(),
    gender: joi.string().valid("male" ,"female"),
    id: joi.string().custom(validationObjectId),
    code: joi.string().pattern(new RegExp(/^\d{4}$/)),
    authorization: joi.string().pattern(new RegExp(/^(Bearer|System) [A-Za-z0-9\-\._~\+\/]+=*$/)),
    file: joi.object().keys({
        fieldname: joi.string().valid("attachment"),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        finalPath: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    })

}

export const validation = (schema) => {
    return (req, res, next) => {
        let inputs = { ...req.body, ...req.params, ...req.query }
        if (req.file || req.files?.length) {
            inputs.file = req.file || req.files
        }
        const validationResult = schema.validate(inputs, { abortEarly: false })
        if (validationResult.error) {
            return res.status(400).json({ message: "Validation Error", validationErrors: validationResult.error.details })
        }
        return next()
    }
}