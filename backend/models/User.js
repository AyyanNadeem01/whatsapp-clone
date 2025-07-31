const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, unique: true, sparse: true },
    phoneSuffix: { type: String, unique: true },
    username: { type: String },
    email: {
        type: String,
        lowercase: true,
        validate: {
            validator: function (value) {
                // Custom regex for email validation
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(value);
            },
            message: "Invalid email format!",
        },
    },
    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },
    profilePicture: { type: String },
    about: { type: String },
    lastSeen: { type: Date },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }, 
    agreed: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
