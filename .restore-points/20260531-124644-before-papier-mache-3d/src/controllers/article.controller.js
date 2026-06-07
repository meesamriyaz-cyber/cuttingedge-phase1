import Article from "../models/Article.js";
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

const articleFields = [
    "title",
    "excerpt",
    "content",
    "articleType",
    "featuredImage",
    "featuredImagePublicId",
    "author",
    "relatedCraft",
    "relatedArtisan",
    "featured",
    "publishDate",
    "status"
];

const ensureRelatedEntitiesExist = async ({
    relatedCraft,
    relatedArtisan
}) => {
    if (relatedCraft) {
        const craftExists =
        await Craft.exists({
            _id: relatedCraft,
            status: true
        });

        if (!craftExists) {
            throw new ApiError(
                "Invalid related craft",
                400
            );
        }
    }

    if (relatedArtisan) {
        const artisanExists =
        await Artisan.exists({
            _id: relatedArtisan,
            status: true
        });

        if (!artisanExists) {
            throw new ApiError(
                "Invalid related artisan",
                400
            );
        }
    }
};

const ensureUniqueSlug = async (slug, excludeId = null) => {
    const query = { slug };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const exists = await Article.exists(query);

    if (exists) {
        throw new ApiError(
            "Article already exists",
            400
        );
    }
};

const populateArticle = (query) => {
    return query
    .populate(
        "relatedCraft",
        "name slug heroImage"
    )
    .populate(
        "relatedArtisan",
        "name slug profilePhoto district"
    );
};

export const createArticle =
asyncHandler(async (req, res) => {
    const data = pickFields(req.body, articleFields);
    const slug = createSlug(data.title);

    await ensureRelatedEntitiesExist(data);
    await ensureUniqueSlug(slug);

    const article =
    await Article.create({
        ...data,
        slug
    });

    return successResponse(
        res,
        "Article created successfully",
        article,
        201
    );
});

export const getArticles =
asyncHandler(async (req, res) => {
    const {
        page,
        limit,
        skip
    } = getPagination(req.query);
    const {
        articleType,
        featured,
        relatedCraft,
        relatedArtisan
    } = req.query;
    const search = req.query.search?.trim();
    const query = {
        status: true
    };

    if (articleType) {
        query.articleType = articleType;
    }

    if (featured === "true") {
        query.featured = true;
    }

    if (relatedCraft) {
        query.relatedCraft = relatedCraft;
    }

    if (relatedArtisan) {
        query.relatedArtisan = relatedArtisan;
    }

    if (search) {
        const regex = {
            $regex: escapeRegex(search),
            $options: "i"
        };

        query.$or = [
            { title: regex },
            { excerpt: regex }
        ];
    }

    const articles =
    await populateArticle(
        Article.find(query)
    )
    .sort({
        publishDate: -1,
        createdAt: -1
    })
    .skip(skip)
    .limit(limit);

    const total =
    await Article.countDocuments(
        query
    );

    return successResponse(
        res,
        "Articles fetched successfully",
        {
            articles,
            total,
            page,
            pages: Math.ceil(total / limit)
        }
    );
});

export const getFeaturedArticles =
asyncHandler(async (req, res) => {
    const articles =
    await populateArticle(
        Article.find({
            featured: true,
            status: true
        })
    )
    .sort({
        publishDate: -1,
        createdAt: -1
    })
    .limit(6);

    return successResponse(
        res,
        "Featured articles fetched successfully",
        articles
    );
});

export const getArticleBySlug =
asyncHandler(async (req, res) => {
    const article =
    await populateArticle(
        Article.findOne({
            slug: req.params.slug,
            status: true
        })
    );

    if (!article) {
        throw new ApiError(
            "Article not found",
            404
        );
    }

    return successResponse(
        res,
        "Article fetched successfully",
        article
    );
});

export const getArticleById =
asyncHandler(async (req, res) => {
    const article =
    await populateArticle(
        Article.findById(
            req.params.id
        )
    );

    if (!article) {
        throw new ApiError(
            "Article not found",
            404
        );
    }

    return successResponse(
        res,
        "Article fetched successfully",
        article
    );
});

export const updateArticle =
asyncHandler(async (req, res) => {
    const article =
    await Article.findById(
        req.params.id
    );

    if (!article) {
        throw new ApiError(
            "Article not found",
            404
        );
    }

    const updates = pickFields(req.body, articleFields);

    await ensureRelatedEntitiesExist(updates);

    if (updates.title) {
        updates.slug = createSlug(updates.title);
        await ensureUniqueSlug(updates.slug, article._id);
    }

    Object.assign(article, updates);
    await article.save();

    return successResponse(
        res,
        "Article updated successfully",
        article
    );
});

export const deleteArticle =
asyncHandler(async (req, res) => {
    const article =
    await Article.findById(
        req.params.id
    );

    if (!article) {
        throw new ApiError(
            "Article not found",
            404
        );
    }

    article.status = false;
    await article.save();

    return successResponse(
        res,
        "Article deleted successfully"
    );
});
