import { roleTypes } from "../../DB/model/User.model.js";

export const endPoint = {
    createComment : [roleTypes.user, roleTypes.admin],
    updateComment : [roleTypes.user, roleTypes.admin],
    deleteComment : [roleTypes.user, roleTypes.admin]
}