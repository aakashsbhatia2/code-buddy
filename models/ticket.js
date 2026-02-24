import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
    userId: { type: String, ref: 'User', required: true },
    id: { type: String, required: true, unique: true },
    number: { type: Number, required: true, unique: true }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;