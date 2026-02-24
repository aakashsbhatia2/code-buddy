import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    ticketId: { type: String, required: true },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
    id: { type: String, required: true, unique: true }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
