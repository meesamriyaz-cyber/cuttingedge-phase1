import mongoose from "mongoose";
import createSlug from "../utils/slugify.js";

const categorySchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    shortDescription: {
        type: String,
        maxlength: 500
    },

    coverImage: String,

    coverImagePublicId: String,

    featured: {
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
}
);

categorySchema.pre("save", async function(){

    if(this.isModified("name")){

        this.slug =
        createSlug(this.name);

    }

});

export default mongoose.model(
    "Category",
    categorySchema
);
