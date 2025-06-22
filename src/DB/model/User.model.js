import mongoose, { Schema, Types, model } from "mongoose";
import { generateHash } from "../../utils/security/hash.security.js";
import postModel from "./Post.model.js";
import commentModel from "./Comment.model.js";

// Enum for user roles
export const roleTypes = {
    user: 'user',
    admin: 'admin',
    superAdmin: 'superAdmin'
};

// Enum for authentication providers
export const providerTypes = {
    google: 'google',
    facebook: 'facebook',
    system: 'system'
};

// User schema definition
const userSchema = new Schema({
    // Basic account information
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },

    // Email verification fields
    confirmEmail: {
        type: Boolean,
        default: false
    },
    confirmEmailOTP: String,

    // Password reset fields
    resetPasswordOTP: String,
    password: {
        type: String,
        required: (data) => data?.provider === providerTypes.system
    },

    // User role and permissions
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },

    // Personal information
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    DOB: Date,
    phone: String,
    address: String,

    // Profile media
    image: {
        public_id: String,
        secure_url: String
    },
    coverImages: [String],

    // Account status fields
    isDeleted: Date,
    changeCredentialTime: Date,
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },

    // Social features
    viewers: [{
        userId: { type: Types.ObjectId, ref: "User" },
        times: [Date]
    }],
    friends: [{ type: Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: Types.ObjectId, ref: "User" }],

    // Audit fields
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },

    // Security fields
    noOfAttemptCode: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    lastAttemptCode: Date,
    twoStepVerification: {
        type: Boolean,
        default: false
    },
    twoStepVerificationOTP: String
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Virtual fields for relationships
userSchema.virtual("posts", {
    ref: "Post",
    localField: "_id",
    foreignField: "createdBy"
});

userSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "createdBy"
});

userSchema.virtual("likes", {
    ref: "Like",
    localField: "_id",
    foreignField: "createdBy"
});


const userModel = mongoose.models.User || model("User", userSchema)
export default userModel

export const socketConnections = new Map()

