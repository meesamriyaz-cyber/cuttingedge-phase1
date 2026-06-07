import mongoose from "mongoose";
import createSlug from "../utils/slugify.js";

const artisanSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },

    village: String,

    district: String,

    craftIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Craft"
    }],

    profilePhoto: String,

    profilePhotoPublicId: String,

    biography: String,

    yearsOfExperience: Number,

    awards: [String],

    featured: {
        type: Boolean,
        default: false
    },

    status: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

artisanSchema.index({
    district: 1
});

artisanSchema.index({
    featured: 1,
    status: 1
});

artisanSchema.pre("save", function () {
    if (this.isModified("name")) {
        this.slug = createSlug(this.name);
    }
});

export default mongoose.model("Artisan", artisanSchema);
