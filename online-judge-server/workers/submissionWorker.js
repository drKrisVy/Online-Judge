import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import generateFile from '../utils/generateFile.js';

// Import all three executors!
import executeCpp from '../utils/executeCpp.js';
import executePython from '../utils/executePython.js';
import executeJava from '../utils/executeJava.js';


const connection = new IORedis({ 
    host: '13.218.219.24', 
    port: 6379, // Standard Redis port
    maxRetriesPerRequest: null 
});

// Initialize the Worker
export const submissionWorker = new Worker('submissionQueue', async (job) => {
    const { submissionId, code, language, problemId } = job.data;
    
    console.log(`[Worker] Picked up submission: ${submissionId} | Language: ${language}`);

    try {
        // 1. Generate the file for local/Docker execution
        const filepath = await generateFile(language, code);

        // Fetch the problem to get the dynamic time limit
        const Problem = mongoose.model('Problem');
        const problem = await Problem.findById(problemId);
        
        // Default to 1000ms if a limit isn't set on the problem
        const timeLimit = problem?.timeLimit || 1000; 

        // 2. Fetch all test cases for this specific problem
        const TestCase = mongoose.model('TestCase'); 
        const testCases = await TestCase.find({ problemId });

        if (!testCases || testCases.length === 0) {
            throw new Error("No test cases found for this problem.");
        }

        // 3. THE JUDGING LOOP
        let finalVerdict = 'Accepted'; 

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            try {
                let output;
                
                // ROUTE TO THE CORRECT EXECUTOR & PASS TIME LIMIT
                if (language === 'cpp') {
                    output = await executeCpp(filepath, tc.input, timeLimit);
                } else if (language === 'py') {
                    output = await executePython(filepath, tc.input, timeLimit);
                } else if (language === 'java') {
                    output = await executeJava(filepath, tc.input, timeLimit);
                } else {
                    throw new Error("Unsupported language");
                }

                // Strict Comparison: Trim spaces and newlines
                const userOutput = output.trim();
                const expectedOutput = tc.output.trim();

                if (userOutput !== expectedOutput) {
                    finalVerdict = 'Wrong Answer';
                    break; // Halt execution on first failure
                }
            } catch (err) {
                console.error("COMPILER/EXECUTION ERROR:", err.stderr || err.message);
                
                // Enhanced Time Limit Exceeded (TLE) detection
                if (err.error && err.error.killed) {
                    finalVerdict = 'Time Limit Exceeded';
                } else if (err.stderr && err.stderr.toLowerCase().includes('time')) {
                    finalVerdict = 'Time Limit Exceeded';
                } else {
                    finalVerdict = 'Compilation Error';
                }
                break;
            }
        }

        // 4. Update the database with the final result
        await Submission.findByIdAndUpdate(submissionId, { verdict: finalVerdict });
        console.log(`[Worker] Finished ${submissionId} | Verdict: ${finalVerdict}`);

    } catch (error) {
        console.error(`[Worker] System Error processing ${submissionId}:`, error);
        await Submission.findByIdAndUpdate(submissionId, { verdict: "System Error" });
    }
}, { connection });

// Global error listener
submissionWorker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job.id} completely failed:`, err);
});