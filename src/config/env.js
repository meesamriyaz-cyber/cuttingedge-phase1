import dotenv from "dotenv";
import { fileURLToPath } from "url";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));

dotenv.config({ path: envPath, override: true, quiet: true });
dotenv.config({ override: false, quiet: true });

const parseList = (value) => {
    if (!value) {
        return [];
    }

    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const corsOrigins = parseList(process.env.CORS_ORIGINS);

if (isProduction && corsOrigins.length === 0) {
    throw new Error("CORS_ORIGINS must be configured in production");
}

export const env = {
    nodeEnv,
    isProduction,
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    corsOrigins,
    bodyLimit: process.env.BODY_LIMIT || "1mb",
    logFormat: process.env.LOG_FORMAT || (isProduction ? "combined" : "dev"),
    trustProxy: process.env.TRUST_PROXY || "0",
    loginRateWindowMs: parseNumber(
        process.env.LOGIN_RATE_WINDOW_MS,
        15 * 60 * 1000
    ),
    loginRateMax: parseNumber(process.env.LOGIN_RATE_MAX, 10)
};
