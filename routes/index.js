import dotenv from "dotenv";
import express from "express";
import apiRoutes from "./api.js";

dotenv.config();

const router = express.Router();

// Mount routes by usecase
router.use("/", apiRoutes);

export default router;
