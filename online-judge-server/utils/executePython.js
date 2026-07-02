import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPathDir = path.join(__dirname, '../outputs');
const inputPathDir = path.join(__dirname, '../inputs');

if (!fs.existsSync(outputPathDir)) fs.mkdirSync(outputPathDir, { recursive: true });
if (!fs.existsSync(inputPathDir)) fs.mkdirSync(inputPathDir, { recursive: true });

const executePy = (filepath, input = "", timeLimit = 1000) => {
    const jobId = path.basename(filepath).split('.')[0];
    const inputFilePath = path.join(inputPathDir, `${jobId}.txt`);
    
    fs.writeFileSync(inputFilePath, input);

    return new Promise((resolve, reject) => {
        // Direct execution using python3
        const command = `python3 "${filepath}" < "${inputFilePath}"`;

        exec(command, { timeout: timeLimit }, (error, stdout, stderr) => {
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

export default executePy;