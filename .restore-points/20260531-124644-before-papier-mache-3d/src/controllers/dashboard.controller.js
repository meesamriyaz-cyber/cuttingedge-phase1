import Craft from "../models/Craft.js";
import Article from "../models/Article.js";
import Media from "../models/Media.js";

import asyncHandler from "../utils/asyncHandler.js";

import {
    successResponse
} from "../utils/apiResponse.js";

import {
    getDashboardStats
} from "../services/dashboard.service.js";

export const getDashboard =
asyncHandler(async (req, res) => {

    const counts =
    await getDashboardStats();

    const [
        featuredCrafts,
        recentArticles,
        recentMedia
    ] = await Promise.all([

        Craft.find({
            featured: true,
            status: true
        })
        .select(
            "name slug heroImage"
        )
        .sort({
            displayOrder: 1
        })
        .limit(5),

        Article.find({
            status: true
        })
        .select(
            "title slug articleType publishDate"
        )
        .sort({
            createdAt: -1
        })
        .limit(5),

        Media.find({
            status: true
        })
        .select(
            "fileName url folder"
        )
        .sort({
            createdAt: -1
        })
        .limit(8)

    ]);

    return successResponse(
        res,
        "Dashboard data fetched successfully",
        {
            counts,
            featuredCrafts,
            recentArticles,
            recentMedia
        }
    );

});