import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // The markdown statement
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    
    // I noticed your Admin screenshot specifically asks for these!
    timeLimit: { type: Number, default: 1000 }, // in milliseconds
    memoryLimit: { type: Number, default: 256 }, // in megabytes
    
    // Optional fields from your HLD
    tags: [{ type: String }],
    boilerplate: { type: Object }
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);