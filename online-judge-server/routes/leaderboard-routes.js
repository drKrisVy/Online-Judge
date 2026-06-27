import express from 'express';
import Submission from '../models/Submission.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const leaderboardData = await Submission.aggregate([
            // 1. Only look at successful solves
            { $match: { verdict: 'Accepted' } },
            
            // 2. Group by user and collect unique problem IDs
            { $group: {
                _id: "$userId",
                solvedProblems: { $addToSet: "$problemId" }
            }},
            
            // 3. Join the users collection
            { $lookup: {
                from: "users", // Mongoose automatically pluralizes "user" to "users"
                localField: "_id",
                foreignField: "_id",
                as: "userInfo"
            }},
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
            
            // 4. THE FIX: Map your schema's "name" to the "username" the frontend wants
            { $project: {
                userId: "$_id",
                username: "$userInfo.name", 
                solvedCount: { $size: "$solvedProblems" },
                _id: 0
            }},
            
            // 5. Sort highest score first, top 50 users
            { $sort: { solvedCount: -1 } },
            { $limit: 50 }
        ]);

        res.status(200).json(leaderboardData);

    } catch (error) {
        console.error("Leaderboard Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch leaderboard." });
    }
});

export default router;