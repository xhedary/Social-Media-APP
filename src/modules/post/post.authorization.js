import { roleTypes } from "../../DB/model/User.model.js";

export const endPoint = {
    createPost : [roleTypes.user, roleTypes.admin],
    freezePost : [roleTypes.user, roleTypes.admin],
    unfreezePost : [roleTypes.user, roleTypes.admin],
    likePost : [roleTypes.user, roleTypes.admin]
}