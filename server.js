import dotenv from "dotenv";
import express from "express";
import routes from "./routes/index.js";
import mongoose from "mongoose";
mongoose.set('strictQuery', false);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);

const start = async() => {
    await mongoose.connect(process.env.MONGO_URI);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
}

start().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});
