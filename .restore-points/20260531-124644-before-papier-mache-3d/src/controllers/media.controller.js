import Media from "../models/Media.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {
    successResponse
} from "../utils/apiResponse.js";
import {
    escapeRegex,
    getPagination,
    pickFields
} from "../utils/query.js";

const mediaFields = [
    "fileName",
    "url",
    "publicId",
    "resourceType",
    "folder",
    "tags",
    "status"
];

const ensureUniquePublicId = async (publicId, excludeId = null) => {
    const query = { publicId };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existingMedia =
    await Media.exists(query);

    if (existingMedia) {
        throw new ApiError(
            "Media already exists",
            400
        );
    }
};

export const createMedia =
asyncHandler(async (req, res) => {
    const data = pickFields(req.body, mediaFields);

    await ensureUniquePublicId(data.publicId);

    const media =
    await Media.create({
        ...data,
        uploadedBy: req.user._id
    });

    return successResponse(
        res,
        "Media created successfully",
        media,
        201
    );
});

export const getMedia =
asyncHandler(async (req, res) => {
    const {
        page,
        limit,
        skip
    } = getPagination(req.query, {
        defaultLimit: 20,
        maxLimit: 100
    });

    const {
        folder,
        search,
        tag
    } = req.query;

    const query = {
        status: true
    };

    if (folder) {
        query.folder = folder;
    }

    if (tag) {
        query.tags = tag;
    }

    if (search) {
        query.fileName = {
            $regex: escapeRegex(search),
            $options: "i"
        };
    }

    const media =
    await Media.find(query)
    .populate(
        "uploadedBy",
        "name email"
    )
    .sort({
        createdAt: -1
    })
    .skip(skip)
    .limit(limit);

    const total =
    await Media.countDocuments(
        query
    );

    return successResponse(
        res,
        "Media fetched successfully",
        {
            media,
            total,
            page,
            pages:
            Math.ceil(total / limit)
        }
    );
});

export const getMediaById =
asyncHandler(async (req, res) => {
    const media =
    await Media.findById(
        req.params.id
    )
    .populate(
        "uploadedBy",
        "name email"
    );

    if (!media) {
        throw new ApiError(
            "Media not found",
            404
        );
    }

    return successResponse(
        res,
        "Media fetched successfully",
        media
    );
});

export const updateMedia =
asyncHandler(async (req, res) => {
    const media =
    await Media.findById(
        req.params.id
    );

    if (!media) {
        throw new ApiError(
            "Media not found",
            404
        );
    }

    const updates = pickFields(req.body, mediaFields);

    if (updates.publicId) {
        await ensureUniquePublicId(updates.publicId, media._id);
    }

    Object.assign(media, updates);
    await media.save();

    return successResponse(
        res,
        "Media updated successfully",
        media
    );
});

export const restoreMedia =
asyncHandler(async (req, res) => {
    const media =
    await Media.findById(
        req.params.id
    );

    if (!media) {
        throw new ApiError(
            "Media not found",
            404
        );
    }

    media.status = true;
    await media.save();

    return successResponse(
        res,
        "Media restored successfully",
        media
    );
});

export const deleteMedia =
asyncHandler(async (req, res) => {
    const media =
    await Media.findById(
        req.params.id
    );

    if (!media) {
        throw new ApiError(
            "Media not found",
            404
        );
    }

    media.status = false;
    await media.save();

    return successResponse(
        res,
        "Media deleted successfully"
    );
});

export const getMediaByFolder =
asyncHandler(async (req, res) => {
    const media =
    await Media.find({
        folder:
        req.params.folder,
        status: true
    })
    .sort({
        createdAt: -1
    });

    return successResponse(
        res,
        "Media fetched successfully",
        media
    );
});
