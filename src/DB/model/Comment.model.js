import mongoose, { Schema, Types, model } from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String, min: 2, max: 50000, trim: true,
        required: function () {
            return this?.attachments?.length > 0 ? false : true
        }
    },
    attachments: [{ secure_url: String, public_id: String }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Types.ObjectId, ref: "Comment" },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: Date,
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

commentSchema.virtual("replies", {
    ref: "Comment",
    localField: "_id",
    foreignField: "commentId"
})

const commentModel = mongoose.models.Comment || model("Comment", commentSchema);
export default commentModel