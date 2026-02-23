import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { resolveIssue, getModelsFromSDK } from "../utils/apiUtils.js";
import User from "../models/user.js";


const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to Code Buddy Server' });
});

// POST issue route
router.post('/issue', async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) throw new Error("Description is required");

        const response = await resolveIssue(description);
        res.status(200).json({ message: "Issue resolved successfully", data: response });
    } catch(error) {
        return res.status(400).json({ error: error.message });
    }
});

// GET models list
router.get('/models/list', async (req, res) => {
    try {
        const models = await getModelsFromSDK();
        res.status(200).json({ 
            models
        });
    } catch (error) {
        res.status(serName400).json({ error: error.message });
    }
});

router.post('/user', async (req, res) => {
    try {
        const { userName, email, password } = req.body?.user || {};
        if (!userName || !email || !password) throw new Error("userName, email, and password are required");

        const passwordHash = await bcrypt.hash(password, 12);
        const user = new User({ userName, email, passwordHash });
        await user.save();

        res.status(200).json({ message: "User profile created successfully", data: user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST login
router.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;
        if (!userName || !password) throw new Error("userName and password are required");

        const user = await User.findOne({ userName });
        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) throw new Error("Invalid password");

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, userName: user.userName },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set token as cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /me - Verify JWT and return user data
router.get('/me', (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new Error("No token provided");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ 
            message: "Token verified", 
            data: decoded 
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// POST /logout - Clear token cookie
router.post('/logout', (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
export default router;
