import express from "express";

import {
    getDashboard
}
from "../controllers/dashboard.controller.js";

import {
    protect,
    authorize
}
from "../middlewares/auth.middleware.js";

const router =
express.Router();

router.get(
    "/",
    protect,
    authorize("admin"),
    getDashboard
);

export default router;