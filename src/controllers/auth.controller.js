import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        email,
        active: true
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
        throw new ApiError("Invalid credentials", 401);
    }

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

    return successResponse(res, "Login successful", {
        token,
        user: userData
    });
});

export const profile = asyncHandler(async (req, res) => {
    return successResponse(res, "Profile fetched", req.user);
});
