import { GraphQLEnumType, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

export const oneUserType = {
    _id: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdBy: { type: GraphQLID },
    updatedBy: { type: GraphQLID },
    deletedBy: { type: GraphQLID },
    isDeleted: { type: GraphQLString },
    gender: {
        type: new GraphQLEnumType({
            name: "gender",
            values: {
                male: { type: GraphQLString },
                female: { type: GraphQLString }
            }
        })
    },
    role: {
        type: new GraphQLEnumType({
            name: "role",
            values: {
                user: { type: GraphQLString },
                admin: { type: GraphQLString },
                superAdmin: { type: GraphQLString }
            }
        })
    },
    provider: {
        type: new GraphQLEnumType({
            name: "provider",
            values: {
                google: { type: GraphQLString },
                facebook: { type: GraphQLString },
                system: { type: GraphQLString }
            }
        })
    }
}


export const oneUserResponse = new GraphQLObjectType({
    name: "oneUserResponse",
    fields: {
        ...oneUserType,
        viewers: {
            type: new GraphQLList(new GraphQLObjectType({
                name: "viewers",
                fields: {
                    ...oneUserType
                }
            }))
        }
    }
})

export const getProfileResponse = new GraphQLObjectType({
    name: "getProfileResponse",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLString },
        data : { type: oneUserResponse }
    }
})

export const usersListResponse = new GraphQLObjectType({
    name: "usersListResponse",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLString },
        users: {
            type: new GraphQLList(oneUserResponse)
        }
    }
})
