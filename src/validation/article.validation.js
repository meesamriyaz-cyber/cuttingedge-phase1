import { z } from "zod";

const objectId = z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid object id");

const articleFields = {
    title: z
        .string()
        .trim()
        .min(5)
        .max(250),

    excerpt:
        z.string()
        .trim()
        .max(1000)
        .optional(),

    content:
        z.string()
        .trim()
        .min(20),

    articleType:
        z.enum([
            "history",
            "story",
            "blog",
            "news",
            "event"
        ]).optional(),

    featuredImage:
        z.string()
        .url()
        .optional(),

    featuredImagePublicId:
        z.string()
        .trim()
        .optional(),

    author:
        z.string()
        .trim()
        .min(2)
        .max(120)
        .optional(),

    relatedCraft:
        objectId.optional(),

    relatedArtisan:
        objectId.optional(),

    featured:
        z.boolean()
        .optional(),

    publishDate:
        z.coerce.date()
        .optional(),

    status:
        z.boolean()
        .optional()
};

export const createArticleSchema =
z.object({
    title: articleFields.title,
    excerpt: articleFields.excerpt,
    content: articleFields.content,
    articleType: articleFields.articleType,
    featuredImage: articleFields.featuredImage,
    featuredImagePublicId: articleFields.featuredImagePublicId,
    author: articleFields.author,
    relatedCraft: articleFields.relatedCraft,
    relatedArtisan: articleFields.relatedArtisan,
    featured: articleFields.featured,
    publishDate: articleFields.publishDate
}).strict();

export const updateArticleSchema =
z.object(articleFields)
.partial()
.strict()
.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
});
