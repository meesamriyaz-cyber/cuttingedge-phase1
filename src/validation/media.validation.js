import { z } from "zod";

const mediaFields = {
    fileName:
        z.string().trim().min(1).max(200),

    url:
        z.string().url(),

    publicId:
        z.string().trim().min(1).max(300),

    resourceType:
        z.enum([
            "image",
            "video",
            "raw"
        ]).optional(),

    folder:
        z.string().trim().min(1).max(100).optional(),

    tags:
        z.array(
            z.string().trim().min(1).max(50)
        ).max(25).optional(),

    status:
        z.boolean().optional()
};

export const createMediaSchema =
z.object({
    fileName: mediaFields.fileName,
    url: mediaFields.url,
    publicId: mediaFields.publicId,
    resourceType: mediaFields.resourceType,
    folder: mediaFields.folder,
    tags: mediaFields.tags
}).strict();

export const updateMediaSchema =
z.object(mediaFields)
.partial()
.strict()
.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
});
