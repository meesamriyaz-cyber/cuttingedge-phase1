import express from "express";

import {
    createCraft,
    getCrafts,
    getCraftBySlug,
    getCraftById,
    updateCraft,
    deleteCraft,
    getFeaturedCrafts
} from "../controllers/craft.controller.js";
import {
    protect,
    authorize
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createCraftSchema,
    updateCraftSchema
} from "../validation/craft.validation.js";

const router = express.Router();

router.get(
    "/featured",
    getFeaturedCrafts
);

router.get(
    "/slug/:slug",
    getCraftBySlug
);

router.get(
    "/",
    getCrafts
);

router.get(
    "/id/:id",
    protect,
    authorize("admin"),
    getCraftById
);

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(createCraftSchema),
    createCraft
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    validate(updateCraftSchema),
    updateCraft
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteCraft
);

export default router;
