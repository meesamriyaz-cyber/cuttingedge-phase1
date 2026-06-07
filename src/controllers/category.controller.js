import Category from "../models/Category.js";

import asyncHandler from "../utils/asyncHandler.js";
import createSlug from "../utils/slugify.js";
import ApiError from "../utils/ApiError.js";
import {
    successResponse
} from "../utils/apiResponse.js";
import {
    escapeRegex,
    getPagination,
    pickFields
} from "../utils/query.js";

const categoryFields = [
    "name",
    "shortDescription",
    "coverImage",
    "coverImagePublicId",
    "featured",
    "displayOrder",
    "status"
];

const ensureUniqueSlug = async (slug, excludeId = null) => {
    const query = { slug };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const exists = await Category.exists(query);

    if (exists) {
        throw new ApiError("Category already exists", 400);
    }
};

export const createCategory =
asyncHandler(async (req, res) => {
    const data = pickFields(req.body, categoryFields);
    const slug = createSlug(data.name);

    await ensureUniqueSlug(slug);

    const category =
    await Category.create({
        ...data,
        slug
    });

    return successResponse(
        res,
        "Category created successfully",
        category,
        201
    );
});

export const getCategories =
asyncHandler(async (req, res) => {
    const {
        page,
        limit,
        skip
    } = getPagination(req.query);
    const search = req.query.search?.trim();
    const query = {
        status: true
    };

    if (search) {
        query.name = {
            $regex: escapeRegex(search),
            $options: "i"
        };
    }

    const categories =
    await Category.find(query)
    .sort({
        displayOrder: 1,
        createdAt: -1
    })
    .skip(skip)
    .limit(limit);

    const total =
    await Category.countDocuments(
        query
    );

    return successResponse(
        res,
        "Categories fetched",
        {
            categories,
            total,
            page,
            pages:
            Math.ceil(total / limit)
        }
    );
});

export const getCategoryBySlug =
asyncHandler(async (req, res) => {
    const category =
    await Category.findOne({
        slug: req.params.slug,
        status: true
    });

    if (!category) {
        throw new ApiError(
            "Category not found",
            404
        );
    }

    return successResponse(
        res,
        "Category fetched",
        category
    );
});

export const updateCategory =
asyncHandler(async (req, res) => {
    const category =
    await Category.findById(
        req.params.id
    );

    if (!category) {
        throw new ApiError(
            "Category not found",
            404
        );
    }

    const updates = pickFields(req.body, categoryFields);

    if (updates.name) {
        updates.slug = createSlug(updates.name);
        await ensureUniqueSlug(updates.slug, category._id);
    }

    Object.assign(
        category,
        updates
    );

    await category.save();

    return successResponse(
        res,
        "Category updated",
        category
    );
});

export const deleteCategory =
asyncHandler(async (req, res) => {
    const category =
    await Category.findById(
        req.params.id
    );

    if (!category) {
        throw new ApiError(
            "Category not found",
            404
        );
    }

    category.status = false;

    await category.save();

    return successResponse(
        res,
        "Category deleted"
    );
});
