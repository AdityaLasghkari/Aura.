import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from './src/models/Song.js';

dotenv.config();

const list = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const songs = await Song.find({}, 'title artist artistId coverUrl audioUrl uploadedBy');
        import('fs').then(fs => {
            fs.writeFileSync('songs_output.json', JSON.stringify(songs, null, 2), 'utf8');
            process.exit(0);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
list();
