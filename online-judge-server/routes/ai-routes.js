import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Initialize the SDK pointing to Groq's free servers using the .env variable
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY, 
    baseURL: "https://api.groq.com/openai/v1",
});

router.post('/generate-hint', async (req, res) => {
    const { code, language, problemTitle, problemDescription, verdict } = req.body;

    if (!code) {
        return res.status(400).json({ message: "No code provided for review." });
    }

    try {
        const prompt = `
            You are an expert Competitive Programming Coach. 
            A student is trying to solve the problem: "${problemTitle}".
            
            Problem Description: 
            ${problemDescription}

            The student submitted the following ${language} code, but it received a verdict of: ${verdict}.
            
            Student's Code:
            \n\n${code}\n\n

            Analyze the code. Provide a short, 2-3 sentence hint pointing out the logical flaw, edge case they missed, or syntax error. 
            DO NOT write the corrected code for them. Be encouraging but highly technical.
        `;

        const completion = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant", 
            messages: [
                { role: "system", content: "You are a helpful coding coach." },
                { role: "user", content: prompt }
            ],
        });

        const hint = completion.choices[0].message.content;

        res.status(200).json({ hint });

    } catch (error) {
        console.error("Groq Execution Error:", error);
        res.status(500).json({ message: "Failed to generate AI hint." });
    }
});

export default router;