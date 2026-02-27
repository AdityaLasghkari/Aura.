import { drive } from './src/config/googleDrive.js';
import dotenv from 'dotenv';
dotenv.config();

async function testStream() {
    try {
        const fileId = '1BeS1PhQBIp7bpYssQASVb3gHZJl2DxnJ';
        const start = 0;
        const end = 10000;

        const driveRes = await drive.files.get(
            { fileId, alt: 'media' },
            {
                responseType: 'stream',
                headers: { Range: `bytes=${start}-${end}` }
            }
        );

        let body = '';
        driveRes.data.on('data', chunk => body += chunk.toString('utf8').substring(0, 100));
        driveRes.data.on('end', () => console.log('Stream ended successfully', body.substring(0, 50)));
        driveRes.data.on('error', err => console.error('Stream error:', err));

    } catch (err) {
        console.error('Catch error:', err.message);
        if (err.response) {
            console.error(err.response.status, err.response.statusText);
        }
    }
}
testStream();
