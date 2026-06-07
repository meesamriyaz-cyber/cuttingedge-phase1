import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const adminEmail = process.env.ADMIN_EMAIL || "admin@kashmirarts.com";
const adminName = process.env.ADMIN_NAME || "Administrator";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD must be configured before seeding admin");
}

const password = adminPassword;

await connectDB();

let admin = await User.findOne({
    email: adminEmail
}).select("+password");

if (admin) {
    admin.name = adminName;
    admin.password = password;
    admin.active = true;
    await admin.save();
}
else {
    admin = await User.create({
        name: adminName,
        email: adminEmail,
        password
    });
}

console.log(`Admin user ready: ${admin.email}`);

await mongoose.disconnect();
process.exit(0);
