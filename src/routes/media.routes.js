import express from "express";

import {
    createMedia,
    getMedia,
    getMediaById,
    updateMedia,
    restoreMedia,
    deleteMedia,
    getMediaByFolder
} from "../controllers/media.controller.js";
import {
    protect,
    authorize
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createMediaSchema,
    updateMediaSchema
} from "../validation/media.validation.js";

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin"),
    getMedia
);

router.get(
    "/folder/:folder",
    protect,
    authorize("admin"),
    getMediaByFolder
);

router.get(
    "/:id",
    protect,
    authorize("admin"),
    getMediaById
);

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(createMediaSchema),
    createMedia
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    validate(updateMediaSchema),
    updateMedia
);

router.patch(
    "/restore/:id",
    protect,
    authorize("admin"),
    restoreMedia
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteMedia
);

export default router;
