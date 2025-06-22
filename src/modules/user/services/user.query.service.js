import * as dbService from "../../../DB/db.service.js"
import userModel from "../../../DB/model/User.model.js"
import { authentication } from "../../../middleware/graph/auth.middlware.js"
export const usersListResponse = async(parent, args) => {
    const users = await dbService.find({ model: userModel, filter: { isDeleted: { $exists: false } } })
    return {message : "success", status : 200, users}
}

export const getProfile = async(parent, args) => {
    const {authorization} = args
    const user = await authentication({authorization})

    return {message : "Done", status : 200, data : user}
}