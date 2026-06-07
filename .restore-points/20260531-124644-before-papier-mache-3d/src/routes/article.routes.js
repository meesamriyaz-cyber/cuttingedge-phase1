import express from "express";

import {
    createArticle,
    getArticles,
    getFeaturedArticles,
    getArticleBySlug,
    getArticleById,
    updateArticle,
    deleteArticle
} from "../controllers/article.controller.js";
import {
    protect,
    authorize
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createArticleSchema,
    updateArticleSchema
} from "../validation/article.validation.js";

const router = express.Router();

router.get(
    "/featured",
    getFeaturedArticles
);

router.get(
    "/slug/:slug",
    getArticleBySlug
);

router.get(
    "/",
    getArticles
);

router.get(
    "/id/:id",
    protect,
    authorize("admin"),
    getArticleById
);

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(createArticleSchema),
    createArticle
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    validate(updateArticleSchema),
    updateArticle
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteArticle
);

export default router;
