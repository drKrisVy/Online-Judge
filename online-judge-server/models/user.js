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
    // Unique handle for leaderboards and profiles
    username: {
        type: String,
        required: true,
        unique: true,
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
    mobileNumber: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    // Determines access level (e.g., locking down the Admin Panel)
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    // Tracks which problems the user has successfully solved
    solvedProblems: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Problem' 
    }]
}, {
    timestamps: true 
});

// Capitalized model names are the standard convention in Mongoose
const User = mongoose.model("User", UserSchema);

export default User;