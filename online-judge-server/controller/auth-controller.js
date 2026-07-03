import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { name, username, email, mobileNumber, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email is already registered" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, username, email, mobileNumber, password: hashedPassword });
        await newUser.save();
        
        return res.status(201).json({ message: "Registration completed successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "24h" }
        );

        // CHANGED: sameSite must be "none" and secure must be true for Vercel to accept the cookie from your AWS server
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, 
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, 
        });

        return res.status(200).json({
            message: "Login successful",
            user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};