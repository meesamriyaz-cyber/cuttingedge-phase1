import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import User from "../models/User.js";

export const protect =
async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No token"
        });
    }

    if (!env.jwtSecret) {
        return res.status(500).json({
            success: false,
            message: "JWT_SECRET is not configured"
        });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, env.jwtSecret);

        req.user =
        await User.findById(
            decoded.id
        ).select("-password");

        if (!req.user || !req.user.active) {
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            });
        }

        return next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Not authorized"
        });
    }
};

export const authorize =
(...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        return next();
    };
};
