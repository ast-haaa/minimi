import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the .env file is loaded from the project root, not relative to cwd
export const PROJECT_ROOT = path.resolve(__dirname, '../../');
export const ENV_FILE_PATH = path.join(PROJECT_ROOT, '.env');

if (fs.existsSync(ENV_FILE_PATH)) {
  dotenv.config({ path: ENV_FILE_PATH });
} else {
  dotenv.config();
}
