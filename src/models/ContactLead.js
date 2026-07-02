import mongoose from "mongoose";

const contactLeadSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    phone: {
        type: String,
        trim: true
    },

    organization: {
        type: String,
        trim: true
    },

    subject: {
        type: String,
        trim: true
    },

    interest: {
        type: String,
        enum: [
            "collector",
            "researcher",
            "artisan",
            "media",
            "other"
        ]
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    leadStatus: {
        type: String,
        enum: [
            "new",
            "contacted",
            "qualified",
            "closed",
            "spam"
        ],
        default: "new"
    },

    adminNotes: {
        type: String,
        trim: true
    },

    source: {
        type: String,
        default: "website"
    },

    requestMetadata: {
        ipAddress: String,
        userAgent: String,
        origin: String
    }
},
{
    timestamps: true
});

contactLeadSchema.index({
    leadStatus: 1,
    createdAt: -1
});

contactLeadSchema.index({
    email: 1,
    createdAt: -1
});

export default mongoose.model(
    "ContactLead",
    contactLeadSchema
);
