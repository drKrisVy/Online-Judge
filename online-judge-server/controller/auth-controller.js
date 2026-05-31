import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Handles new user registration
 * Hashes the password and saves the user to the database
 */
export const registerUser = async (req, res) => {
    try {
        // 1. Extract the data the user typed into the frontend form
        const { name, email, mobileNumber, password } = req.body;

        // 2. Check if the email is already in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // 3. The Security Lock: Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the new user using our Schema blueprint
        const newUser = new User({
            name,
            email,
            mobileNumber,
            password: hashedPassword,
        });

        // 5. Save them to MongoDB
        await newUser.save();
        return res.status(201).json({ message: "Registration completed successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Handles user login
 * Verifies credentials and issues an HTTP-only JWT cookie
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by their email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 2. Check the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 3. Generate the VIP Wristband (JWT)
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // 4. Send the token back inside a secure HTTP-Only Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        return res.status(200).json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};