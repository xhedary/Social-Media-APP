import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql"

export const imageType = new GraphQLObjectType({
    name: "attachment",
    fields: {
        public_id: { type: GraphQLString },
        secure_url: { type: GraphQLString }
    }
})

export const onePostResponse = new GraphQLObjectType({
    name: "onePostResponse",
    fields: {
        _id: { type: GraphQLString },
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(imageType) },
        tags: { type: new GraphQLList(GraphQLID) },
        likes: { type: new GraphQLList(GraphQLID) },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        createdBy: { type: GraphQLID },
        updatedBy: { type: GraphQLID },
        deletedBy: { type: GraphQLID },
        isDeleted: { type: GraphQLString }
    }
})

export const postListResponse = new GraphQLObjectType({
    name: "postListResponse",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLString },
        posts: {
            type: new GraphQLList(onePostResponse)
        }
    }
})

export const likePostResponse = new GraphQLObjectType({
    name: "likePostResponse",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLString },
        data : { type: onePostResponse }
    }
})