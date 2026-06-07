import Craft from "../models/Craft.js";
import Category from "../models/Category.js";
import Artisan from "../models/Artisan.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import createSlug from "../utils/slugify.js";
import { successResponse } from "../utils/apiResponse.js";
import {
    escapeRegex,
    getPagination,
    pickFields
} from "../utils/query.js";
import {
    getArtisansByCraft
} from "../services/artisan.service.js";

const craftFields = [
    "category",
    "name",
    "shortDescription",
    "description",
    "history",
    "makingProcess",
    "geographicalSignificance",
    "heroImage",
    "heroImagePublicId",
    "galleryImages",
    "relatedArtisans",
    "featured",
    "displayOrder",
    "marketplaceEnabled",
    "status"
];

const ensureCategoryExists = async (categoryId) => {
    const categoryExists =
    await Category.exists({
        _id: categoryId,
        status: true
    });

    if (!categoryExists) {
        throw new ApiError(
            "Invalid category",
            400
        );
    }
};

const ensureArtisansExist = async (artisanIds = []) => {
    const uniqueIds = [...new Set(artisanIds.map(String))];

    if (uniqueIds.length === 0) {
        return;
    }

    const count =
    await Artisan.countDocuments({
        _id: { $in: uniqueIds },
        status: true
    });

    if (count !== uniqueIds.length) {
        throw new ApiError(
            "Invalid related artisan",
            400
        );
    }
};

const ensureUniqueSlug = async (slug, excludeId = null) => {
    const query = { slug };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const exists = await Craft.exists(query);

    if (exists) {
        throw new ApiError(
            "Craft already exists",
            400
        );
    }
};

export const createCraft =
asyncHandler(async (req, res) => {
    const data = pickFields(req.body, craftFields);
    const slug = createSlug(data.name);

    await ensureCategoryExists(data.category);
    await ensureArtisansExist(data.relatedArtisans);
    await ensureUniqueSlug(slug);

    const craft =
    await Craft.create({
        ...data,
        slug
    });

    return successResponse(
        res,
        "Craft created successfully",
        craft,
        201
    );
});

export const getCrafts =
asyncHandler(async (req, res) => {
    const {
        page,
        limit,
        skip
    } = getPagination(req.query);
    const search = req.query.search?.trim();
    const category = req.query.category;
    const featured = req.query.featured;
    const query = {
        status: true
    };

    if (search) {
        query.name = {
            $regex: escapeRegex(search),
            $options: "i"
        };
    }

    if (category) {
        query.category = category;
    }

    if (featured === "true") {
        query.featured = true;
    }

    const crafts =
    await Craft.find(query)
    .populate(
        "category",
        "name slug"
    )
    .populate(
        "relatedArtisans",
        "name slug district profilePhoto"
    )
    .sort({
        displayOrder: 1,
        createdAt: -1
    })
    .skip(skip)
    .limit(limit);

    const total =
    await Craft.countDocuments(
        query
    );

    return successResponse(
        res,
        "Crafts fetched successfully",
        {
            crafts,
            total,
            page,
            pages: Math.ceil(
                total / limit
            )
        }
    );
});

export const getCraftBySlug =
asyncHandler(async (req, res) => {
    const craft =
    await Craft.findOne({
        slug: req.params.slug,
        status: true
    })
    .populate(
        "category",
        "name slug"
    );

    if (!craft) {
        throw new ApiError(
            "Craft not found",
            404
        );
    }

    const artisans =
    await getArtisansByCraft(
        craft._id
    );

    return successResponse(
        res,
        "Craft fetched successfully",
        {
            craft,
            artisans
        }
    );
});

export const getCraftById =
asyncHandler(async (req, res) => {
    const craft =
    await Craft.findById(
        req.params.id
    )
    .populate(
        "category",
        "name slug"
    )
    .populate(
        "relatedArtisans"
    );

    if (!craft) {
        throw new ApiError(
            "Craft not found",
            404
        );
    }

    return successResponse(
        res,
        "Craft fetched successfully",
        craft
    );
});

export const updateCraft =
asyncHandler(async (req, res) => {
    const craft =
    await Craft.findById(
        req.params.id
    );

    if (!craft) {
        throw new ApiError(
            "Craft not found",
            404
        );
    }

    const updates = pickFields(req.body, craftFields);

    if (updates.category) {
        await ensureCategoryExists(updates.category);
    }

    if (updates.relatedArtisans) {
        await ensureArtisansExist(updates.relatedArtisans);
    }

    if (updates.name) {
        updates.slug = createSlug(updates.name);
        await ensureUniqueSlug(updates.slug, craft._id);
    }

    Object.assign(
        craft,
        updates
    );

    await craft.save();

    return successResponse(
        res,
        "Craft updated successfully",
        craft
    );
});

export const deleteCraft =
asyncHandler(async (req, res) => {
    const craft =
    await Craft.findById(
        req.params.id
    );

    if (!craft) {
        throw new ApiError(
            "Craft not found",
            404
        );
    }

    craft.status = false;

    await craft.save();

    return successResponse(
        res,
        "Craft deleted successfully"
    );
});

export const getFeaturedCrafts =
asyncHandler(async (req, res) => {
    const crafts =
    await Craft.find({
        featured: true,
        status: true
    })
    .populate(
        "category",
        "name slug"
    )
    .sort({
        displayOrder: 1
    });

    return successResponse(
        res,
        "Featured crafts fetched successfully",
        crafts
    );
});
