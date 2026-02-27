import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const list = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const curators = await User.find({ role: 'admin' }, 'name _id avatar');
        console.log(JSON.stringify(curators, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
list();
