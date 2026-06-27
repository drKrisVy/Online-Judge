import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirCodes = path.join(__dirname, '../codes');

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (format, code) => {
    const jobId = uuid(); 
    const filename = `${jobId}.${format}`; 
    const filepath = path.join(dirCodes, filename);
    
    fs.writeFileSync(filepath, code);
    return filepath;
};

export default generateFile;