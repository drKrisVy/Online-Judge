import express from 'express';
import mongoose from 'mongoose';
import Submission from '../models/Submission.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // VALIDATE THE ID FORMAT FIRST
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format." });
        }

        // 1. Fetch all submissions by this user, newest first
        const submissions = await Submission.find({ userId }).sort({ createdAt: -1 });

        if (!submissions || submissions.length === 0) {
            return res.status(200).json({ totalAttempts: 0, solvedCount: 0, recentSubmissions: [] });
        }

        // 2. Calculate unique problems solved (only count 'Accepted' verdicts)
        const acceptedSubmissions = submissions.filter(s => s.verdict === 'Accepted');
        
        // Use a Set to ensure we only count each problem once, even if they solved it 5 times
        const uniqueSolvedIds = new Set(acceptedSubmissions.map(s => s.problemId.toString()));

        // 3. Package the stats
        const stats = {
            totalAttempts: submissions.length,
            solvedCount: uniqueSolvedIds.size,
            recentSubmissions: submissions.slice(0, 10) 
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch user profile." });
    }
});

export default router;