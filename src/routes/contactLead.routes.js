import express from "express";

import {
    createContactLead,
    getContactLeads,
    getContactLeadById,
    updateContactLead
} from "../controllers/contactLead.controller.js";
import {
    protect,
    authorize
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createContactLeadSchema,
    updateContactLeadSchema
} from "../validation/contactLead.validation.js";
import {
    createRateLimiter
} from "../middlewares/rateLimit.middleware.js";
import { env } from "../config/env.js";

const router = express.Router();
const contactLimiter = createRateLimiter({
    windowMs: env.contactRateWindowMs,
    max: env.contactRateMax,
    message: "Too many messages. Please try again later."
});

router.post(
    "/",
    contactLimiter,
    validate(createContactLeadSchema),
    createContactLead
);

router.get(
    "/",
    protect,
    authorize("admin"),
    getContactLeads
);

router.get(
    "/:id",
    protect,
    authorize("admin"),
    getContactLeadById
);

router.patch(
    "/:id",
    protect,
    authorize("admin"),
    validate(updateContactLeadSchema),
    updateContactLead
);

export default router;
