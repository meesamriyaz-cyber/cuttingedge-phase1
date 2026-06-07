import express from "express";

import {
    createArtisan,
    getArtisans,
    getFeaturedArtisans,
    getArtisanBySlug,
    getArtisanById,
    updateArtisan,
    deleteArtisan
} from "../controllers/artisan.controller.js";
import {
    protect,
    authorize
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createArtisanSchema,
    updateArtisanSchema
} from "../validation/artisan.validation.js";

const router = express.Router();

router.get(
    "/featured",
    getFeaturedArtisans
);

router.get(
    "/slug/:slug",
    getArtisanBySlug
);

router.get(
    "/",
    getArtisans
);

router.get(
    "/id/:id",
    protect,
    authorize("admin"),
    getArtisanById
);

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(createArtisanSchema),
    createArtisan
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    validate(updateArtisanSchema),
    updateArtisan
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteArtisan
);

export default router;
