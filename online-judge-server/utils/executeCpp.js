import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the directories exist
const codesPathDir = path.join(__dirname, '../codes');
const outputPathDir = path.join(__dirname, '../outputs');
const inputPathDir = path.join(__dirname, '../inputs');

if (!fs.existsSync(outputPathDir)) fs.mkdirSync(outputPathDir, { recursive: true });
if (!fs.existsSync(inputPathDir)) fs.mkdirSync(inputPathDir, { recursive: true });

const executeCpp = (filepath, input = "") => {
    const jobId = path.basename(filepath).split('.')[0];
    const inputFilePath = path.join(inputPathDir, `${jobId}.txt`);
    const outPath = path.join(outputPathDir, `${jobId}.out`);

    // Write the test case to a text file
    fs.writeFileSync(inputFilePath, input);

    return new Promise((resolve, reject) => {
        // We removed 'docker run'. It just directly uses the g++ we installed!
        const command = `g++ "${filepath}" -o "${outPath}" && "${outPath}" < "${inputFilePath}"`;

        exec(command, { timeout: 8000 }, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stderr });
                return;
            }
            if (stderr) {
                reject({ stderr });
                return;
            }
            resolve(stdout);
        });
    });
};

export default executeCpp;