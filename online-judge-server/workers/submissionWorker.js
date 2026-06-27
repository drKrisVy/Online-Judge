import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import generateFile from '../utils/generateFile.js';
import executeCpp from '../utils/executeCpp.js';

// Connect to Redis
const connection = new IORedis({ maxRetriesPerRequest: null });

// Initialize the Worker
export const submissionWorker = new Worker('submissionQueue', async (job) => {
    const { submissionId, code, language, problemId } = job.data;
    
    console.log(`[Worker] Picked up submission: ${submissionId}`);

    try {
        // 1. Generate the file for Docker to use
        const filepath = await generateFile(language, code);

        // 2. Fetch all test cases for this specific problem
        // We use mongoose.model to dynamically grab it without circular dependency issues
        const TestCase = mongoose.model('TestCase'); 
        const testCases = await TestCase.find({ problemId });

        if (!testCases || testCases.length === 0) {
            throw new Error("No test cases found for this problem.");
        }

        // 3. THE JUDGING LOOP
        let finalVerdict = 'Accepted'; // Assume correct until a test case fails

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            try {
                // Execute Docker container with the specific test case input
                const output = await executeCpp(filepath, tc.input);

                // Strict Comparison: Trim spaces and newlines
                const userOutput = output.trim();
                const expectedOutput = tc.output.trim();

                if (userOutput !== expectedOutput) {
                    finalVerdict = 'Wrong Answer';
                    break; // Halt execution on first failure
                }
            } catch (err) {
                // Determine if it was a timeout or a syntax issue
                finalVerdict = err.error && err.error.killed ? 'Time Limit Exceeded' : 'Compilation Error';
                break;
            }
        }

        // 4. Update the database with the final result
        await Submission.findByIdAndUpdate(submissionId, { verdict: finalVerdict });
        console.log(`[Worker] Finished ${submissionId} | Verdict: ${finalVerdict}`);

    } catch (error) {
        console.error(`[Worker] System Error processing ${submissionId}:`, error);
        
        // If the system itself crashes (e.g., file generation fails)
        await Submission.findByIdAndUpdate(submissionId, { verdict: "System Error" });
    }
}, { connection });

// Global error listener for the worker thread
submissionWorker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job.id} completely failed:`, err);
});