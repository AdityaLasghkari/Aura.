import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function checkSongs() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const songs = await db.collection('songs').find({ title: { $in: ['Dum-A-Dum', 'Mai Bairagan', 'Tulsi Shyam'] } }).toArray();
    fs.writeFileSync('songs_debug.json', JSON.stringify(songs, null, 2));
    process.exit(0);
}

checkSongs();
