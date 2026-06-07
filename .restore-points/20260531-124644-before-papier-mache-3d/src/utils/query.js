export const escapeRegex = (value = "") => {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getPagination = (
    query,
    {
        defaultLimit = 10,
        maxLimit = 50
    } = {}
) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const requestedLimit = Number(query.limit) || defaultLimit;
    const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
};

export const pickFields = (source, fields) => {
    return fields.reduce((picked, field) => {
        if (source[field] !== undefined) {
            picked[field] = source[field];
        }

        return picked;
    }, {});
};
