import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, required: true },
    passwordHash: { type: String, required: true }
});

export default mongoose.model("User", userSchema);
