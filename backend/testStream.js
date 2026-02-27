import dotenv from 'dotenv';
dotenv.config();
import { drive, loadCredentials } from './src/config/googleDrive.js';

async function testDrive() {
    try {
        loadCredentials();
        const fileId = '1BeS1PhQBIp7bpYssQASVb3gHZJl2DxnJ';
        const meta = await drive.files.get({ fileId, fields: 'size,mimeType' });
        console.log(meta.data);
    } catch (err) {
        console.error('Stack:', err.stack);
        console.error('Response:', err.response?.data);
    }
}

testDrive();
