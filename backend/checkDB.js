import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from './src/models/Song.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const songCount = await Song.countDocuments();
        console.log(`Total songs: ${songCount}`);

        const songs = await Song.find().limit(5);
        songs.forEach(song => {
            console.log(`Song: ${song.title}, Cover: ${song.coverUrl}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkData();
