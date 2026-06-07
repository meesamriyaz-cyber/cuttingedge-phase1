import { env } from "../config/env.js";

export const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error(err);
    const statusCode = err.statusCode || 500;
    const message = statusCode >= 500 && env.isProduction
        ? "Internal Server Error"
        : err.message || "Internal Server Error";
    const response = {
        success: false,
        message
    };

    if (err.details && statusCode < 500) {
        response.details = err.details;
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid resource id"
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: "Duplicate resource"
        });
    }

    return res.status(statusCode).json(response);

};

export const notFoundHandler = (req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found"
    });
};
