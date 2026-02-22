import express from "express";
import { resolveIssue, getModelsFromSDK } from "../utils/apiUtils.js";

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
        res.status(400).json({ error: error.message });
    }
});

export default router;
