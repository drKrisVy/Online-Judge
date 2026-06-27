import express from 'express';
import Submission from '../models/Submission.js';
import { submissionQueue } from '../queues/submissionQueue.js';

const router = express.Router();

// 1. The Async Submit Route
router.post('/submit', async (req, res) => {
    try {
        const { code, language, problemId, userId } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Empty code body" });
        }

        // Step A: Save to DB immediately with a "Pending" verdict
        const newSubmission = new Submission({
            userId,
            problemId,
            code,
            language,
            verdict: 'Pending'
        });
        await newSubmission.save();

        // Step B: Drop the payload into the Redis Queue
        // The worker will pick this up and do all the heavy compiling and testing
        await submissionQueue.add('process-submission', {
            submissionId: newSubmission._id,
            code,
            language,
            problemId
        });

        // Step C: Instantly respond to the frontend! (Do not wait for Docker)
        res.status(202).json({
            message: "Code submitted and is being processed.",
            submissionId: newSubmission._id,
            verdict: "Pending"
        });

    } catch (error) {
        console.error("Submission Routing Error:", error);
        res.status(500).json({ error: "Failed to submit code." });
    }
});

// 2. The Polling Route
// The frontend CodePlex UI will ping this route every second to see if the worker is done
router.get('/status/:id', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        
        res.status(200).json({ verdict: submission.verdict });
    } catch (error) {
        res.status(500).json({ error: "Failed to check status." });
    }
});

export default router;