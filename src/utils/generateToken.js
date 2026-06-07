import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateToken = (id) => {
    if (!env.jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
    }

    if (
        env.isProduction &&
        (env.jwtSecret.length < 32 ||
            /replace|secret|changeme/i.test(env.jwtSecret))
    ) {
        throw new Error("JWT_SECRET is too weak for production");
    }

    return jwt.sign({ id }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn
    });
};

export default generateToken;
