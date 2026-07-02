import ContactLead from "../models/ContactLead.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {
    successResponse
} from "../utils/apiResponse.js";
import {
    escapeRegex,
    getPagination,
    pickFields
} from "../utils/query.js";

const publicFields = [
    "name",
    "email",
    "phone",
    "organization",
    "subject",
    "interest",
    "message"
];

const adminFields = [
    "leadStatus",
    "adminNotes"
];

const requestMetadata = (req) => ({
    ipAddress: req.ip?.slice(0, 100),
    userAgent: req.get("user-agent")?.slice(0, 500),
    origin: req.get("origin")?.slice(0, 300)
});

export const createContactLead =
asyncHandler(async (req, res) => {
    const lead = await ContactLead.create({
        ...pickFields(req.body, publicFields),
        source: "website",
        requestMetadata: requestMetadata(req)
    });

    return successResponse(
        res,
        "Thank you. Your message has been received.",
        {
            id: lead._id,
            submittedAt: lead.createdAt
        },
        201
    );
});

export const getContactLeads =
asyncHandler(async (req, res) => {
    const {
        page,
        limit,
        skip
    } = getPagination(req.query);
    const {
        leadStatus,
        interest
    } = req.query;
    const search = req.query.search?.trim();
    const query = {};

    if (leadStatus) {
        query.leadStatus = leadStatus;
    }

    if (interest) {
        query.interest = interest;
    }

    if (search) {
        const regex = {
            $regex: escapeRegex(search),
            $options: "i"
        };

        query.$or = [
            { name: regex },
            { email: regex },
            { phone: regex },
            { organization: regex },
            { subject: regex }
        ];
    }

    const [leads, total] = await Promise.all([
        ContactLead.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        ContactLead.countDocuments(query)
    ]);

    return successResponse(
        res,
        "Contact leads fetched successfully",
        {
            leads,
            total,
            page,
            pages: Math.ceil(total / limit)
        }
    );
});

export const getContactLeadById =
asyncHandler(async (req, res) => {
    const lead = await ContactLead.findById(
        req.params.id
    );

    if (!lead) {
        throw new ApiError(
            "Contact lead not found",
            404
        );
    }

    return successResponse(
        res,
        "Contact lead fetched successfully",
        lead
    );
});

export const updateContactLead =
asyncHandler(async (req, res) => {
    const lead = await ContactLead.findById(
        req.params.id
    );

    if (!lead) {
        throw new ApiError(
            "Contact lead not found",
            404
        );
    }

    Object.assign(
        lead,
        pickFields(req.body, adminFields)
    );
    await lead.save();

    return successResponse(
        res,
        "Contact lead updated successfully",
        lead
    );
});
