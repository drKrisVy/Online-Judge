import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define all three directories we need to mount into Docker
const codesPathDir = path.join(__dirname, '../codes');
const outputPathDir = path.join(__dirname, '../outputs');
const inputPathDir = path.join(__dirname, '../inputs');

if (!fs.existsSync(outputPathDir)) fs.mkdirSync(outputPathDir, { recursive: true });
if (!fs.existsSync(inputPathDir)) fs.mkdirSync(inputPathDir, { recursive: true });

const executeCpp = (filepath, input = "") => {
    const jobId = path.basename(filepath).split('.')[0];
    const inputFilePath = path.join(inputPathDir, `${jobId}.txt`);

    // Write the database test cases to a text file
    fs.writeFileSync(inputFilePath, input);

    return new Promise((resolve, reject) => {
        // THE DOCKER COMMAND
        // --rm: Instantly destroy the container after it finishes
        // -v: Mount local Mac folders into the container's virtual file system
        const command = `docker run --rm -v "${codesPathDir}":/codes -v "${outputPathDir}":/outputs -v "${inputPathDir}":/inputs gcc:latest sh -c "g++ /codes/${jobId}.cpp -o /outputs/${jobId}.out && /outputs/${jobId}.out < /inputs/${jobId}.txt"`;

        // Bumped timeout to 8 seconds to account for Docker startup time
        exec(command, { timeout: 8000 }, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stderr });
            }
            if (stderr) {
                reject(stderr);
            }
            resolve(stdout);
        });
    });
};

export default executeCpp;