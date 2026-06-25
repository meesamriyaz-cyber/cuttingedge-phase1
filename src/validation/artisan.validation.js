import { z } from "zod";

const objectId = z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid object id");

const artworkImageSchema = z.object({
    url: z.string().url(),
    publicId: z.string().trim().min(1),
    caption: z.string().trim().max(200).optional(),
    craftId: objectId.optional()
}).strict();

const artisanFields = {
    name: z
        .string()
        .trim()
        .min(2)
        .max(150),

    village:
        z.string().trim().max(100).optional(),

    district:
        z.string().trim().max(100).optional(),

    biography:
        z.string().trim().max(5000).optional(),

    profilePhoto:
        z.string()
        .url()
        .optional(),

    profilePhotoPublicId:
        z.string()
        .trim()
        .optional(),

    artworkImages:
        z.array(artworkImageSchema)
        .max(30)
        .optional(),

    yearsOfExperience:
        z.number()
        .int()
        .min(0)
        .max(100)
        .optional(),

    craftIds:
        z.array(objectId)
        .optional(),

    awards:
        z.array(
            z.string().trim().min(1).max(150)
        ).max(50).optional(),

    featured:
        z.boolean().optional(),

    status:
        z.boolean().optional()
};

export const createArtisanSchema =
z.object({
    name: artisanFields.name,
    village: artisanFields.village,
    district: artisanFields.district,
    biography: artisanFields.biography,
    profilePhoto: artisanFields.profilePhoto,
    profilePhotoPublicId: artisanFields.profilePhotoPublicId,
    artworkImages: artisanFields.artworkImages,
    yearsOfExperience: artisanFields.yearsOfExperience,
    craftIds: artisanFields.craftIds,
    awards: artisanFields.awards,
    featured: artisanFields.featured
}).strict();

export const updateArtisanSchema =
z.object(artisanFields)
.partial()
.strict()
.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
});
