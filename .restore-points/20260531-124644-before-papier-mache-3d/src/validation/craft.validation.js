import { z } from "zod";

const objectId = z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid object id");

const craftFields = {
    category: objectId,

    name: z
        .string()
        .trim()
        .min(2)
        .max(150),

    shortDescription:
        z.string()
        .trim()
        .max(500)
        .optional(),

    description:
        z.string()
        .trim()
        .optional(),

    history:
        z.string()
        .trim()
        .optional(),

    makingProcess:
        z.string()
        .trim()
        .optional(),

    geographicalSignificance:
        z.string()
        .trim()
        .optional(),

    heroImage:
        z.string()
        .url()
        .optional(),

    heroImagePublicId:
        z.string()
        .trim()
        .optional(),

    galleryImages:
        z.array(
            z.object({
                url: z.string().url(),
                publicId: z.string().trim().min(1)
            }).strict()
        )
        .optional(),

    relatedArtisans:
        z.array(objectId)
        .optional(),

    featured:
        z.boolean()
        .optional(),

    marketplaceEnabled:
        z.boolean()
        .optional(),

    displayOrder:
        z.number()
        .int()
        .min(0)
        .optional(),

    status:
        z.boolean()
        .optional()
};

export const createCraftSchema =
z.object({
    category: craftFields.category,
    name: craftFields.name,
    shortDescription: craftFields.shortDescription,
    description: craftFields.description,
    history: craftFields.history,
    makingProcess: craftFields.makingProcess,
    geographicalSignificance: craftFields.geographicalSignificance,
    heroImage: craftFields.heroImage,
    heroImagePublicId: craftFields.heroImagePublicId,
    galleryImages: craftFields.galleryImages,
    relatedArtisans: craftFields.relatedArtisans,
    featured: craftFields.featured,
    marketplaceEnabled: craftFields.marketplaceEnabled,
    displayOrder: craftFields.displayOrder
}).strict();

export const updateCraftSchema =
z.object(craftFields)
.partial()
.strict()
.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
});
