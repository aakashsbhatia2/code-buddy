import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { resolveIssue, getModelsFromSDK, upsertTicket, addComment, getCommentsForTicket } from "../utils/apiUtils.js";
import User from "../models/user.js";
import Ticket from "../models/ticket.js";


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
        const { userName, email, password, firstName, lastName } = req.body?.user || {};
        if (!userName || !email || !password) throw new Error("userName, email, and password are required");

        const passwordHash = await bcrypt.hash(password, 12);
        const id = uuidv4();
        const user = new User({ userName, email, passwordHash, id, firstName, lastName });
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
            { id: user.id, email: user.email, userName: user.userName },
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

// GET /tickets/list - Retrieve all tickets
router.get('/tickets/list', async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.status(200).json({ message: "Tickets retrieved successfully", data: tickets });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /ticket - Create a new ticket
router.post('/ticket', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            throw new Error("title and description are required");
        }
        
        const token = req.cookies.token;
        if (!token) throw new Error("No token provided");
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const id = uuidv4();
        
        // Get the next ticket number
        const lastTicket = await Ticket.findOne().sort({ number: -1 });
        const nextNumber = lastTicket ? (parseInt(lastTicket.number) + 1).toString() : "1";
        
        const ticket = new Ticket({ title, description, userId, id, number: nextNumber });
        await ticket.save();
        
        res.status(201).json({ message: "Ticket created successfully", data: ticket });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /ticket/:id - Update a ticket
router.put('/ticket/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const token = req.cookies.token;
        if (!token) throw new Error("No token provided");
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        // Upsert ticket using utility function
        const ticket = await upsertTicket(id, userId, req.body);
        
        res.status(200).json({ message: "Ticket updated successfully", data: ticket });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /ticket/:id/comment - Add a comment to a ticket
router.post('/ticket/:id/comment', async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        
        if (!content) {
            throw new Error("Comment content is required");
        }
        
        const token = req.cookies.token;
        if (!token) throw new Error("No token provided");
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        const comment = await addComment(id, userId, content);
        
        res.status(201).json({ message: "Comment added successfully", data: comment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /ticket/:id/comments - Get all comments for a ticket
router.get('/ticket/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        
        const comments = await getCommentsForTicket(id);
        
        res.status(200).json({ message: "Comments retrieved successfully", data: comments });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
