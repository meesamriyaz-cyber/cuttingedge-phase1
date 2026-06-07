import mongoose from "mongoose";
import createSlug from "../utils/slugify.js";

const galleryImageSchema = new mongoose.Schema(
{
    url: {
        type: String,
        required: true
    },

    publicId: {
        type: String,
        required: true
    }
},
{
    _id: false
});

const craftSchema = new mongoose.Schema(
{
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true
    },

    shortDescription: {
        type: String,
        maxlength: 500
    },

    description: String,

    history: String,

    makingProcess: String,

    geographicalSignificance: String,

    heroImage: String,

    heroImagePublicId: String,

    galleryImages: [galleryImageSchema],

    relatedArtisans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artisan"
    }],

    featured: {
        type: Boolean,
        default: false
    },

    marketplaceEnabled: {
        type: Boolean,
        default: false
    },

    displayOrder: {
        type: Number,
        default: 0
    },

    status: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

craftSchema.index({
    category: 1,
    status: 1
});



craftSchema.pre("save", function() {

    if (this.isModified("name")) {
        this.slug = createSlug(this.name);
    }

});

export default mongoose.model("Craft", craftSchema);
