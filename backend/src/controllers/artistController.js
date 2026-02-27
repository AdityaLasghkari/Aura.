import Artist from '../models/Artist.js';
import { uploadToGoogleDrive } from '../utils/uploadHelper.js';
import { normalizeArtist, normalizeArtists } from '../utils/coverUrlHelper.js';

// @desc    Check if artist exists
// @route   GET /api/artists/check/:name
// @access  Private/Admin
export const checkArtist = async (req, res) => {
    try {
        const artist = await Artist.findOne({ name: new RegExp(`^${req.params.name}$`, 'i') });
        if (artist) {
            return res.json({ success: true, exists: true, artist: normalizeArtist(artist) });
        }
        res.json({ success: true, exists: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
export const getArtists = async (req, res) => {
    try {
        const artists = await Artist.find({ isActive: true }).sort('name');
        res.json({ success: true, data: normalizeArtists(artists) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create artist (can be used independently or during song upload)
export const createArtistInternal = async (name, photoFile, bio = '') => {
    let photoUrl = undefined;
    let cloudinaryPhotoId = undefined;

    if (photoFile) {
        const result = await uploadToGoogleDrive(photoFile);
        photoUrl = result.url;
        cloudinaryPhotoId = result.id;
    }

    const artist = await Artist.create({
        name,
        photoUrl,
        bio,
        cloudinaryPhotoId
    });

    return artist;
};
