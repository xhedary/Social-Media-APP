import mongoose, { Types, model } from "mongoose";
export const freindRequestStatus = { pending: "pending", accepted: "accepted", rejected: "rejected" }
const freindRequestSchema = new mongoose.Schema({
    sender: { type: Types.ObjectId, ref: "User", required: true },
    receiver: { type: Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: Object.values(freindRequestStatus), default: freindRequestStatus.pending },
}, {
    timestamps: true
})

const freindRequestModel = mongoose.models.FreindRequest || model("FreindRequest", freindRequestSchema);
export default freindRequestModel