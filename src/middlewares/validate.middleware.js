import ApiError from "../utils/ApiError.js";

const validate = (schema) => {

    return (req, res, next) => {

        const result =
        schema.safeParse(req.body);

        if (!result.success) {

            const errors =
            result.error.issues.map(
                err => ({
                    field: err.path.join("."),
                    message: err.message
                })
            );

            return next(
                new ApiError(
                    "Validation failed",
                    400,
                    errors
                )
            );

        }

        req.body = result.data;

        next();

    };

};

export default validate;
