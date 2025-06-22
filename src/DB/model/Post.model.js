import mongoose, { Schema, Types, model } from "mongoose";

const postSchema =  new Schema({
    content: { type: String, min : 2, max : 50000 , trim : true, 
        required : function () {
            return this?.attachments?.length > 0 ? false : true
        }},
    attachments: [{secure_url : String, public_id : String}],
    tags : [{type : Types.ObjectId, ref : "User"}],
    likes : [{type : Types.ObjectId, ref : "User"}],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User"},
    deletedBy: { type: Types.ObjectId, ref: "User"},
    isDeleted: Date,
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}); 

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId"
})
const postModel = mongoose.models.Post || model("Post", postSchema);
export default postModel