import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';
import { uploadToGoogleDrive, deleteFromGoogleDrive } from '../utils/uploadHelper.js';
import { normalizeSongs, normalizeCoverUrl } from '../utils/coverUrlHelper.js';
import jwt from 'jsonwebtoken';
import ytSearch from 'yt-search';

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res) => {
    const { name, description, isPublic } = req.body;

    try {
        const existingPlaylist = await Playlist.findOne({ name });
        if (existingPlaylist) {
            return res.status(200).json({ success: false, message: 'A playlist with this name already exists' });
        }

        let coverUrl = null;

        if (req.file) {
            const coverResult = await uploadToGoogleDrive(
                req.file,
                '1OgcqIjf299ZJcfhjgpIGz2R4WvRmHs6I'
            );
            coverUrl = coverResult.url;
        }

        const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        let pub = true;
        if (isPublic === 'false' || isPublic === false) pub = false;

        const playlist = await Playlist.create({
            name,
            description,
            isPublic: pub,
            userId: req.user._id,
            coverUrl,
            shareCode,
        });

        res.status(201).json({
            success: true,
            message: 'Playlist created successfully',
            data: { playlist },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Import a YouTube Playlist
// @route   POST /api/playlists/import-youtube
// @access  Private
export const importYoutubePlaylist = async (req, res) => {
    const { listId } = req.body;

    if (!listId) {
        return res.status(400).json({ message: 'Playlist ID is required' });
    }

    try {
        const ytPlaylist = await ytSearch({ listId });

        if (!ytPlaylist || !ytPlaylist.videos) {
            return res.status(404).json({ message: 'Playlist not found on YouTube' });
        }

        const songIds = [];

        // Loop through videos and create/find songs
        for (const video of ytPlaylist.videos) {
            const ytAudioUrl = `yt_${video.videoId}`;

            let song = await Song.findOne({ audioUrl: ytAudioUrl });

            if (!song) {
                try {
                    song = await Song.create({
                        title: video.title || 'Unknown Title',
                        artist: video.author.name || 'Unknown Artist',
                        audioUrl: ytAudioUrl,
                        coverUrl: video.thumbnail,
                        duration: video.duration.seconds || 0,
                        genre: 'Other',
                        uploadedBy: req.user._id,
                        isActive: true
                    });
                } catch (songErr) {
                    console.error('Error saving YT song details:', songErr);
                    continue; // Skip invalid songs
                }
            }
            songIds.push(song._id);
        }

        const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const playlist = await Playlist.create({
            name: ytPlaylist.title || 'YouTube Import',
            description: 'Imported from YouTube',
            isPublic: true,
            userId: req.user._id,
            coverUrl: ytPlaylist.image || ytPlaylist.thumbnail || (ytPlaylist.videos[0]?.thumbnail),
            shareCode,
            songs: songIds
        });

        res.status(201).json({
            success: true,
            message: 'YouTube Playlist imported successfully',
            data: { playlist },
        });

    } catch (error) {
        console.error('YT_IMPORT_ERR:', error);
        res.status(500).json({ message: 'Error importing YouTube Playlist' });
    }
};

// @desc    Append YouTube Playlist to existing Playlist
// @route   POST /api/playlists/:id/add-youtube
// @access  Private
export const addYoutubeToPlaylist = async (req, res) => {
    const { listId } = req.body;

    if (!listId) {
        return res.status(400).json({ message: 'YouTube Playlist ID is required' });
    }

    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        if (playlist.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit this playlist' });
        }

        const ytPlaylist = await ytSearch({ listId });
        if (!ytPlaylist || !ytPlaylist.videos) {
            return res.status(404).json({ message: 'Playlist not found on YouTube' });
        }

        const songIds = [];

        for (const video of ytPlaylist.videos) {
            const ytAudioUrl = `yt_${video.videoId}`;
            let song = await Song.findOne({ audioUrl: ytAudioUrl });

            if (!song) {
                try {
                    song = await Song.create({
                        title: video.title || 'Unknown Title',
                        artist: video.author.name || 'Unknown Artist',
                        audioUrl: ytAudioUrl,
                        coverUrl: video.thumbnail,
                        duration: video.duration.seconds || 0,
                        genre: 'Other',
                        uploadedBy: req.user._id,
                        isActive: true
                    });
                } catch (songErr) {
                    console.error('Error saving YT song details:', songErr);
                    continue;
                }
            }
            if (!playlist.songs.includes(song._id)) {
                playlist.songs.push(song._id);
            }
        }

        // Only set cover art if the existing playlist doesn't have one
        if (!playlist.coverUrl && ytPlaylist.videos[0]?.thumbnail) {
            playlist.coverUrl = ytPlaylist.videos[0].thumbnail;
        }

        await playlist.save();

        res.json({
            success: true,
            message: 'YouTube Playlist appended successfully',
            data: { playlist },
        });

    } catch (error) {
        console.error('YT_APPEND_ERR:', error);
        res.status(500).json({ message: 'Error appending YouTube Playlist' });
    }
};


// @desc    Get user's playlists
// @route   GET /api/playlists/user/:userId
// @access  Private
export const getUserPlaylists = async (req, res) => {
    const playlists = await Playlist.find({ userId: req.params.userId })
        .populate('songs', 'title artist coverUrl duration');

    const formattedPlaylists = playlists.map(p => {
        const pObj = p.toObject();
        pObj.songs = normalizeSongs(pObj.songs);
        pObj.coverUrl = normalizeCoverUrl(pObj.coverUrl);
        return pObj;
    });

    res.json({ success: true, data: { playlists: formattedPlaylists } });
};

// @desc    Get all public playlists
// @route   GET /api/playlists
// @access  Public
export const getPublicPlaylists = async (req, res) => {
    try {
        const { genre, search } = req.query;
        let query = { isPublic: true };

        if (genre) {
            // This assumes songs in playlist might match genre, 
            // or we might need a genre field on Playlist itself.
            // For now, let's keep it simple.
            // If the model has genre, we use it.
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const playlists = await Playlist.find(query)
            .populate('userId', 'name avatar')
            .populate('songs', 'title artist coverUrl');

        const formattedPlaylists = playlists.map(p => {
            const pObj = p.toObject();
            pObj.songs = normalizeSongs(pObj.songs);
            pObj.coverUrl = normalizeCoverUrl(pObj.coverUrl);
            return pObj;
        });

        res.json({ success: true, data: { playlists: formattedPlaylists } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single playlist
// @route   GET /api/playlists/:id
// @access  Public
export const getPlaylistById = async (req, res) => {
    const { code } = req.query;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { _id: decoded.id };
        } catch (error) {
            // Invalid token, ignore
        }
    }

    const playlist = await Playlist.findById(req.params.id)
        .populate('userId', 'name avatar')
        .populate({
            path: 'songs',
            populate: { path: 'uploadedBy', select: 'name' }
        });

    if (playlist && (
        playlist.isPublic ||
        (req.user && playlist.userId._id.toString() === req.user._id.toString()) ||
        (code && playlist.shareCode === code)
    )) {
        const playlistObj = playlist.toObject();
        playlistObj.songs = normalizeSongs(playlistObj.songs);
        playlistObj.coverUrl = normalizeCoverUrl(playlistObj.coverUrl);

        res.json({ success: true, data: { playlist: playlistObj } });
    } else {
        res.status(404).json({ message: 'Playlist not found or is private' });
    }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private
export const addSongToPlaylist = async (req, res) => {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to edit this playlist' });
    }

    await playlist.addSong(songId);

    res.json({
        success: true,
        message: 'Song added to playlist',
        data: { playlist },
    });
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
export const removeSongFromPlaylist = async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to edit this playlist' });
    }

    await playlist.removeSong(req.params.songId);

    res.json({
        success: true,
        message: 'Song removed from playlist',
        data: { playlist },
    });
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
export const deletePlaylist = async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete image from Drive if it exists
    if (playlist.coverUrl && playlist.coverUrl.includes('/stream/')) {
        try {
            const parts = playlist.coverUrl.split('/stream/');
            if (parts.length > 1) {
                const fileId = parts[1].split('?')[0]; // in case of query params
                await deleteFromGoogleDrive(fileId);
            }
        } catch (err) {
            console.error('Error deleting image from drive:', err);
        }
    }

    await playlist.deleteOne();

    res.json({
        success: true,
        message: 'Playlist deleted successfully',
    });
};
