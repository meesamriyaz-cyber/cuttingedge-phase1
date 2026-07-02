import { z } from "zod";

const optionalText = (max) =>
z.preprocess(
    (value) => typeof value === "string" && value.trim() === ""
        ? undefined
        : value,
    z.string().trim().max(max).optional()
);

export const createContactLeadSchema =
z.object({
    name: z
        .string()
        .trim()
        .min(2)
        .max(120),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email()
        .max(254),

    phone: optionalText(30),

    organization: optionalText(160),

    subject: optionalText(200),

    interest: z.enum([
        "collector",
        "researcher",
        "artisan",
        "media",
        "other"
    ]).optional(),

    message: z
        .string()
        .trim()
        .min(10)
        .max(5000)
}).strict();

export const updateContactLeadSchema =
z.object({
    leadStatus: z.enum([
        "new",
        "contacted",
        "qualified",
        "closed",
        "spam"
    ]).optional(),

    adminNotes: z
        .string()
        .trim()
        .max(5000)
        .optional()
})
.strict()
.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
});
