import { drive, loadCredentials } from './src/config/googleDrive.js';
import dotenv from 'dotenv';

dotenv.config();

const checkQuota = async () => {
    try {
        loadCredentials();
        const response = await drive.about.get({
            fields: 'storageQuota'
        });

        const quota = response.data.storageQuota;
        const total = (quota.limit / (1024 ** 3)).toFixed(2);
        const used = (quota.usage / (1024 ** 3)).toFixed(2);
        const remaining = (total - used).toFixed(2);

        console.log(`TOTAL_CAPACITY: ${total} GB`);
        console.log(`USED_STORAGE: ${used} GB`);
        console.log(`REMAINING: ${remaining} GB`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to get quota:', err.response ? err.response.data : err.message);
        if (err.errors) console.error('Errors:', err.errors);
        process.exit(1);
    }
};

checkQuota();
