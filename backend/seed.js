import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from './src/models/Song.js';
import User from './src/models/User.js';

dotenv.config();

const songs = [
    {
        title: 'Vanguard',
        artist: 'Elara Vox',
        album: 'Silica',
        genre: 'Techno',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 240,
        uploadedBy: '699571511682f177ec0548fd', // Replace with dynamic ID
        releaseDate: new Date('2024-01-15')
    },
    {
        title: 'Lunar Echo',
        artist: 'Cortex',
        album: 'Orbit',
        genre: 'Experimental',
        coverUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 310,
        uploadedBy: '699571511682f177ec0548fd',
        releaseDate: new Date('2023-11-20')
    },
    {
        title: 'Symphony X',
        artist: 'Aura Collective',
        album: 'Modern Orchestration',
        genre: 'Classical',
        coverUrl: 'https://images.unsplash.com/photo-1507838596058-a762b05a63bc?q=80&w=1000&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 425,
        uploadedBy: '699571511682f177ec0548fd',
        releaseDate: new Date('2024-02-01')
    },
    {
        title: 'Vox Populi',
        artist: 'The Periphery',
        album: 'Voices',
        genre: 'Vocal',
        coverUrl: 'https://images.unsplash.com/photo-1470225620800-2fe5a5564a93?q=80&w=1000&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 195,
        uploadedBy: '699571511682f177ec0548fd',
        releaseDate: new Date('2024-01-10')
    },
    {
        title: 'Kinetic Energy',
        artist: 'Motion',
        album: 'Velocity',
        genre: 'Drum & Bass',
        coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 280,
        uploadedBy: '699571511682f177ec0548fd',
        releaseDate: new Date('2024-01-25')
    },
    {
        title: 'Less is More',
        artist: 'Minimalist Group',
        album: 'Restraint',
        genre: 'Minimalist',
        coverUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=1000&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 350,
        uploadedBy: '699571511682f177ec0548fd',
        releaseDate: new Date('2022-06-12')
    },
    {
        title: 'The Void',
        artist: 'Darkness',
        album: 'Introspection',
        genre: 'Dark Ambient',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 600,
        uploadedBy: '699571511682f177ec0548fd',
        releaseDate: new Date('2024-02-14')
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne();
        if (!user) {
            console.error('No user found to assign songs to. Please create a user first.');
            process.exit(1);
        }

        const userId = user._id;
        const songsWithUser = songs.map(s => ({ ...s, uploadedBy: userId }));

        await Song.deleteMany({});
        await Song.insertMany(songsWithUser);

        console.log('Database seeded with songs!');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seedDB();
