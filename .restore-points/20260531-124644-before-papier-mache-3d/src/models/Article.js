import mongoose from "mongoose";
import createSlug from "../utils/slugify.js";

const articleSchema = new mongoose.Schema(
{
    title: {
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

    excerpt: {
        type: String,
        maxlength: 1000
    },

    content: {
        type: String,
        required: true
    },

    articleType: {
        type: String,
        enum: [
            "history",
            "story",
            "blog",
            "news",
            "event"
        ],
        default: "blog"
    },

    featuredImage: String,

    featuredImagePublicId: String,

    author: {
        type: String,
        default: "Admin"
    },

    relatedCraft: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Craft"
    },

    relatedArtisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artisan"
    },

    featured: {
        type: Boolean,
        default: false
    },

    publishDate: {
        type: Date,
        default: Date.now
    },

    status: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

articleSchema.index({
    articleType: 1,
    publishDate: -1
});

articleSchema.index({
    featured: 1,
    status: 1
});

articleSchema.index({
    relatedCraft: 1
});

articleSchema.index({
    relatedArtisan: 1
});

articleSchema.pre("save", function () {
    if (this.isModified("title")) {
        this.slug = createSlug(this.title);
    }
});

export default mongoose.model("Article", articleSchema);
