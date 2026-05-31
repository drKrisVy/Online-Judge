import mongoose from "mongoose";

/**
 * MongoDB schema for User authentication and profiles
 * Stores primary login credentials, indexing the email for instant lookup speeds
 */
const UserSchema = new mongoose.Schema({
    // Full name provided by the user during signup
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // Primary login identifier. Indexed for O(1) performance lookup.
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
    },
    // Optional contact number for platform alerts or future 2FA
    mobileNumber: {
        type: String,
        trim: true,
    },
    // Bcrypt hashed password. NEVER stored as plain text.
    password: {
        type: String,
        required: true,
    },
}, {
    // Automatically generates 'createdAt' and 'updatedAt' timestamps for every user
    timestamps: true 
});

// Create and export the User model based on the schema
const User = mongoose.model("user", UserSchema);

export default User;