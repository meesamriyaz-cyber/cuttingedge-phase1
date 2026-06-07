import Artisan from "../models/Artisan.js";
import Craft from "../models/Craft.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import createSlug from "../utils/slugify.js";
import {
    successResponse
} from "../utils/apiResponse.js";
import {
    escapeRegex,
    getPagination,
    pickFields
} from "../utils/query.js";

const artisanFields = [
    "name",
    "village",
    "district",
    "craftIds",
    "profilePhoto",
    "profilePhotoPublicId",
    "biography",
    "yearsOfExperience",
    "awards",
    "featured",
    "status"
];

const ensureCraftsExist = async (craftIds = []) => {
    const uniqueIds = [...new Set(craftIds.map(String))];

    if (uniqueIds.length === 0) {
        return;
    }

    const count =
    await Craft.countDocuments({
        _id: { $in: uniqueIds },
        status: true
    });

    if (count !== uniqueIds.length) {
        throw new ApiError(
            "Invalid craft",
            400
        );
    }
};

const ensureUniqueSlug = async (slug, excludeId = null) => {
    const query = { slug };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const exists = await Artisan.exists(query);

    if (exists) {
        throw new ApiError(
            "Artisan already exists",
            400
        );
    }
};

export const createArtisan =
asyncHandler(async (req, res) => {
    const data = pickFields(req.body, artisanFields);
    const slug = createSlug(data.name);

    await ensureCraftsExist(data.craftIds);
    await ensureUniqueSlug(slug);

    const artisan =
    await Artisan.create({
        ...data,
        slug
    });

    return successResponse(
        res,
        "Artisan created successfully",
        artisan,
        201
    );
});

export const getArtisans =
asyncHandler(async (req, res) => {
    const {
        page,
        limit,
        skip
    } = getPagination(req.query);
    const {
        craft,
        district,
        featured
    } = req.query;
    const search = req.query.search?.trim();
    const query = {
        status: true
    };

    if (search) {
        const regex = {
            $regex: escapeRegex(search),
            $options: "i"
        };

        query.$or = [
            { name: regex },
            { village: regex },
            { district: regex }
        ];
    }

    if (craft) {
        query.craftIds = craft;
    }

    if (district) {
        query.district = {
            $regex: escapeRegex(district),
            $options: "i"
        };
    }

    if (featured === "true") {
        query.featured = true;
    }

    const artisans =
    await Artisan.find(query)
    .populate(
        "craftIds",
        "name slug heroImage"
    )
    .sort({
        featured: -1,
        name: 1
    })
    .skip(skip)
    .limit(limit);

    const total =
    await Artisan.countDocuments(
        query
    );

    return successResponse(
        res,
        "Artisans fetched successfully",
        {
            artisans,
            total,
            page,
            pages: Math.ceil(total / limit)
        }
    );
});

export const getFeaturedArtisans =
asyncHandler(async (req, res) => {
    const artisans =
    await Artisan.find({
        featured: true,
        status: true
    })
    .populate(
        "craftIds",
        "name slug"
    )
    .sort({
        name: 1
    })
    .limit(12);

    return successResponse(
        res,
        "Featured artisans fetched successfully",
        artisans
    );
});

export const getArtisanBySlug =
asyncHandler(async (req, res) => {
    const artisan =
    await Artisan.findOne({
        slug: req.params.slug,
        status: true
    })
    .populate(
        "craftIds",
        "name slug heroImage shortDescription"
    );

    if (!artisan) {
        throw new ApiError(
            "Artisan not found",
            404
        );
    }

    return successResponse(
        res,
        "Artisan fetched successfully",
        artisan
    );
});

export const getArtisanById =
asyncHandler(async (req, res) => {
    const artisan =
    await Artisan.findById(
        req.params.id
    )
    .populate(
        "craftIds",
        "name slug"
    );

    if (!artisan) {
        throw new ApiError(
            "Artisan not found",
            404
        );
    }

    return successResponse(
        res,
        "Artisan fetched successfully",
        artisan
    );
});

export const updateArtisan =
asyncHandler(async (req, res) => {
    const artisan =
    await Artisan.findById(
        req.params.id
    );

    if (!artisan) {
        throw new ApiError(
            "Artisan not found",
            404
        );
    }

    const updates = pickFields(req.body, artisanFields);

    if (updates.craftIds) {
        await ensureCraftsExist(updates.craftIds);
    }

    if (updates.name) {
        updates.slug = createSlug(updates.name);
        await ensureUniqueSlug(updates.slug, artisan._id);
    }

    Object.assign(artisan, updates);
    await artisan.save();

    return successResponse(
        res,
        "Artisan updated successfully",
        artisan
    );
});

export const deleteArtisan =
asyncHandler(async (req, res) => {
    const artisan =
    await Artisan.findById(
        req.params.id
    );

    if (!artisan) {
        throw new ApiError(
            "Artisan not found",
            404
        );
    }

    artisan.status = false;
    await artisan.save();

    return successResponse(
        res,
        "Artisan deleted successfully"
    );
});
