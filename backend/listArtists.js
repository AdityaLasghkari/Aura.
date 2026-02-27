import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artist from './src/models/Artist.js';

dotenv.config();

const list = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const artists = await Artist.find({});
        console.log(JSON.stringify(artists, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
list();
