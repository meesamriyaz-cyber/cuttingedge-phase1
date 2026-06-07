const getClientKey = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.trim()) {
        return forwardedFor.split(",")[0].trim();
    }

    return req.ip || req.socket?.remoteAddress || "unknown";
};

export const createRateLimiter = ({
    windowMs,
    max,
    message = "Too many requests"
}) => {
    const attempts = new Map();

    const cleanup = setInterval(() => {
        const now = Date.now();

        for (const [key, entry] of attempts.entries()) {
            if (entry.resetAt <= now) {
                attempts.delete(key);
            }
        }
    }, windowMs);

    cleanup.unref?.();

    return (req, res, next) => {
        const key = getClientKey(req);
        const now = Date.now();
        const entry = attempts.get(key);

        if (!entry || entry.resetAt <= now) {
            attempts.set(key, {
                count: 1,
                resetAt: now + windowMs
            });

            return next();
        }

        entry.count += 1;

        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.set("Retry-After", String(retryAfter));

            return res.status(429).json({
                success: false,
                message
            });
        }

        return next();
    };
};
