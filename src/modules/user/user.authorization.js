import { roleTypes } from "../../DB/model/User.model.js";

export const endpoint = {
    dashboard : [roleTypes.superAdmin, roleTypes.admin],
    changeRole : [roleTypes.superAdmin, roleTypes.admin]
}