import { drive } from './src/config/googleDrive.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const fileId = '1BeS1PhQBIp7bpYssQASVb3gHZJl2DxnJ';
        const meta = await drive.files.get({ fileId, fields: 'size,mimeType' });
        console.log(meta.data);
    } catch (e) {
        console.error("FAIL", e);
    }
}
test();
