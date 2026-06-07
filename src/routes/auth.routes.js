import express from "express";

import {
    login,
    profile
} from "../controllers/auth.controller.js";
import {
    protect
} from "../middlewares/auth.middleware.js";
import {
    createRateLimiter
} from "../middlewares/rateLimit.middleware.js";
import { env } from "../config/env.js";
import validate from "../middlewares/validate.middleware.js";
import {
    loginSchema
} from "../validation/auth.validation.js";

const router = express.Router();
const loginLimiter = createRateLimiter({
    windowMs: env.loginRateWindowMs,
    max: env.loginRateMax,
    message: "Too many login attempts. Please try again later."
});

router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    login
);

router.get(
    "/profile",
    protect,
    profile
);

export default router;
