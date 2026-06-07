import express from "express";

import {
    createCategory,
    getCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory
}
from "../controllers/category.controller.js";

import {
    protect,
    authorize
}
from "../middlewares/auth.middleware.js";
import validate
from "../middlewares/validate.middleware.js";

import {
    createCategorySchema,
    updateCategorySchema
}
from "../validation/category.validation.js";
const router =
express.Router();

// public routes

router.get(
    "/",
    getCategories
);

router.get(
    "/:slug",
    getCategoryBySlug
);

//Admin routes

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(createCategorySchema),
    createCategory
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    validate(updateCategorySchema),
    updateCategory
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteCategory
);

export default router;
