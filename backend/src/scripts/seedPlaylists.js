import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Playlist from '../models/Playlist.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedPlaylists = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create or Find an Editorial User
        let editorialUser = await User.findOne({ email: 'editorial@aura.music' });

        if (!editorialUser) {
            console.log('Creating Editorial User...');
            editorialUser = await User.create({
                name: 'AURA EDITORIAL',
                email: 'editorial@aura.music',
                password: 'aura_editorial_secure_password_2024',
                role: 'admin',
                bio: 'Formal sonic architectures and curated archives for the modern minimalist.',
                avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&h=400&auto=format&fit=crop'
            });
        }

        const playlists = [
            {
                name: 'BRUTALIST SECTOR',
                description: 'Industrial textures and raw concrete beats. Architectural soundscapes for deep focus.',
                userId: editorialUser._id,
                coverUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop',
                isPublic: true,
                tags: ['industrial', 'techno', 'architecture']
            },
            {
                name: 'GLASS HOUSE',
                description: 'Translucent melodies and light-refracting synths. High-fidelity clarity for airy spaces.',
                userId: editorialUser._id,
                coverUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop',
                isPublic: true,
                tags: ['ethereal', 'synth', 'pop']
            },
            {
                name: 'THE ARCHIVE 01',
                description: 'Rare analogue finds and dusty groove-based soul. Curated from the deep vaults.',
                userId: editorialUser._id,
                coverUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=800&auto=format&fit=crop',
                isPublic: true,
                tags: ['vinyl', 'analogue', 'jazz']
            },
            {
                name: 'URBAN SILENCE',
                description: 'Late-night sonic architectures for the solitary traveler. Rainy streets and neon reflections.',
                userId: editorialUser._id,
                coverUrl: 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?q=80&w=800&auto=format&fit=crop',
                isPublic: true,
                tags: ['night', 'lo-fi', 'mood']
            },
            {
                name: 'BONE WHITE',
                description: 'Minimalist piano and bleached acoustic strings. Pure sculptural silence.',
                userId: editorialUser._id,
                coverUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop',
                isPublic: true,
                tags: ['minimalist', 'classical', 'quiet']
            },
            {
                name: 'CHROMIUM',
                description: 'Metallic pop and liquid electronic structures. High-gloss energy for the near future.',
                userId: editorialUser._id,
                coverUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop',
                isPublic: true,
                tags: ['futuristic', 'electronic', 'sharp']
            }
        ];

        console.log('Cleaning existing sample playlists...');
        // Only delete playlists created by the editorial user to avoid wiping user data
        await Playlist.deleteMany({ userId: editorialUser._id });

        console.log('Seeding playlists...');
        const createdPlaylists = await Playlist.insertMany(playlists);

        // Update user's playlist references
        editorialUser.playlists = createdPlaylists.map(p => p._id);
        await editorialUser.save();

        console.log(`Success! Seeded ${createdPlaylists.length} editorial playlists.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedPlaylists();
