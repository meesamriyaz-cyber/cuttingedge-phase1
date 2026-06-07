import { z } from "zod";

const categoryFields = {
    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    shortDescription: z
        .string()
        .trim()
        .max(500)
        .optional(),

    coverImage: z
        .string()
        .url()
        .optional(),

    coverImagePublicId:
        z.string().trim().optional(),

    featured:
        z.boolean().optional(),

    displayOrder:
        z.number().int().min(0).optional(),

    status:
        z.boolean().optional()
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
