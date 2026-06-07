import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
{
    fileName: {
        type: String,
        required: true,
        trim: true
    },

    url: {
        type: String,
        required: true
    },

    publicId: {
        type: String,
        required: true,
        unique: true
    },

    resourceType: {
        type: String,
        enum: [
            "image",
            "video",
            "raw"
        ],
        default: "image"
    },

    folder: {
        type: String,
        default: "general"
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    tags: [String],

    status: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

mediaSchema.index({
    folder: 1
});

mediaSchema.index({
    uploadedBy: 1
});

export default mongoose.model("Media", mediaSchema);
