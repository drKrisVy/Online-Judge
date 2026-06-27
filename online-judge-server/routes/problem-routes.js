import express from 'express';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';

const router = express.Router();

// POST: Create a new problem (This handles that Admin Form you showed me)
router.post('/admin/create', async (req, res) => {
    try {
        const { title, description, difficulty, timeLimit, memoryLimit, testCases } = req.body;

        // 1. Create and save the main Problem first
        const newProblem = new Problem({
            title,
            description,
            difficulty,
            timeLimit,
            memoryLimit
        });
        const savedProblem = await newProblem.save();

        // 2. If the admin provided test cases, save them and link them to the problem's ID
        if (testCases && testCases.length > 0) {
            const formattedTestCases = testCases.map(tc => ({
                problemId: savedProblem._id, // This is the crucial link!
                input: tc.input,
                output: tc.output,
                isHidden: tc.isHidden
            }));
            
            // Insert all test cases into the isolated collection at once
            await TestCase.insertMany(formattedTestCases);
        }

        res.status(201).json({ 
            message: 'Problem and test cases created successfully!', 
            problemId: savedProblem._id 
        });

    } catch (error) {
        console.error("Error creating problem:", error);
        res.status(500).json({ message: 'Server error while creating problem' });
    }
});

// GET: Fetch all problems (This feeds the "Problemset" table)
router.get('/', async (req, res) => {
    try {
        // We use .select() to only grab the title and difficulty for the table.
        // We don't want to load massive descriptions for 100 problems at once!
        const problems = await Problem.find().select('title difficulty createdAt');
        res.status(200).json(problems);
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ message: 'Server error fetching problems' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        // 1. Find the specific problem
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // 2. Find ONLY the public test cases for this problem (isHidden: false)
        // We NEVER send hidden test cases to the frontend!
        const publicTestCases = await TestCase.find({ 
            problemId: problem._id, 
            isHidden: false 
        }).select('input output');

        res.status(200).json({ problem, testCases: publicTestCases });
    } catch (error) {
        console.error("Error fetching problem:", error);
        res.status(500).json({ message: 'Server error fetching problem details' });
    }
});
export default router;