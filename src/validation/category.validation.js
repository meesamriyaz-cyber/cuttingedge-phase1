import { z } from "zod";

const optionalText = (schema) =>
    z.preprocess(
        value => value === "" ? undefined : value,
        schema.optional()
    );

const optionalNumber = z.preprocess(
    value => value === "" || value === null ? undefined : value,
    z.coerce.number().int().min(0).optional()
);

const optionalBoolean = z.preprocess(
    value => {
        if (value === "" || value === null) return undefined;
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
    },
    z.boolean().optional()
);

const categoryFields = {
    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    shortDescription: optionalText(
        z.string().trim().max(500)
    ),

    coverImage: optionalText(
        z.string().trim().url()
    ),

    coverImagePublicId:
        optionalText(z.string().trim()),

    featured:
        optionalBoolean,

    displayOrder:
        optionalNumber,

    status:
        optionalBoolean
};

export const createCategorySchema =
z.object({
    name: categoryFields.name,
    shortDescription: categoryFields.shortDescription,
    coverImage: categoryFields.coverImage,
    coverImagePublicId: categoryFields.coverImagePublicId,
    featured: categoryFields.featured,
    displayOrder: categoryFields.displayOrder
}).strict();

export const updateCategorySchema =
z.object(categoryFields)
.partial()
.strict()
.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
});
