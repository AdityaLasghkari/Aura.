import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Playlist from './src/models/Playlist.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const removeDuplicatePlaylists = async () => {
    await connectDB();

    try {
        const playlists = await Playlist.find({});
        const nameMap = new Map();

        let removedCount = 0;

        for (const playlist of playlists) {
            const name = playlist.name.toLowerCase().trim();
            if (nameMap.has(name)) {
                // Duplicate found
                console.log(`Removing duplicate playlist: ${playlist.name} (ID: ${playlist._id})`);
                await Playlist.deleteOne({ _id: playlist._id });
                removedCount++;
            } else {
                nameMap.set(name, playlist._id);
            }
        }

        console.log(`Removed ${removedCount} duplicate playlists.`);
        process.exit(0);
    } catch (error) {
        console.error('Error removing duplicates:', error);
        process.exit(1);
    }
};

removeDuplicatePlaylists();
