
import { GraphQLNonNull, GraphQLString } from "graphql"
import * as userGraphService from "./services/user.query.service.js"
import * as userTypes from "./types/user.type.js"
export const query = {
    listUsers: {
        type: userTypes.usersListResponse,
        resolve: userGraphService.usersListResponse
    },
    getProfile: {
        type: userTypes.getProfileResponse,
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: userGraphService.getProfile
    }
}

export const mutation = {
    
}