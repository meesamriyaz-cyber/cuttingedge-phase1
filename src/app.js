import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import craftRoutes from "./routes/craft.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import artisanRoutes from "./routes/artisan.routes.js";
import articleRoutes from "./routes/article.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import contactLeadRoutes from "./routes/contactLead.routes.js";
import {
    errorHandler,
    notFoundHandler
} from "./middlewares/error.middleware.js";

const app = express();
const devOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
];
const allowedOrigins = env.corsOrigins.length > 0
    ? env.corsOrigins
    : devOrigins;

morgan.format("json", (tokens, req, res) => {
    return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTimeMs: Number(tokens["response-time"](req, res)),
        contentLength: tokens.res(req, res, "content-length") || "0"
    });
});

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const error = new Error("Not allowed by CORS");
        error.statusCode = 403;

        return callback(error);
    },
    credentials: true
};

if (env.trustProxy !== "0") {
    const trustProxy = env.trustProxy === "true"
        ? true
        : Number(env.trustProxy) || env.trustProxy;

    app.set("trust proxy", trustProxy);
}

app.disable("x-powered-by");
app.use(express.json({ limit: env.bodyLimit }));
app.use(express.urlencoded({
    extended: true,
    limit: env.bodyLimit
}));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan(env.logFormat));

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is healthy"
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/crafts", craftRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/artisans", artisanRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/contact", contactLeadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
