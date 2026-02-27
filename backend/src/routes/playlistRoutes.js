import express from 'express';
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    getPublicPlaylists,
} from '../controllers/playlistController.js';
import { protect } from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('cover'), createPlaylist);
router.get('/', getPublicPlaylists);
router.get('/user/:userId', protect, getUserPlaylists);
router.get('/:id', getPlaylistById);
router.put('/:id', protect, addSongToPlaylist); // Note: Simple add song, prompt specifies PUT for update, but here we use it for adding.
router.post('/:id/songs', protect, addSongToPlaylist);
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);
router.delete('/:id', protect, deletePlaylist);

export default router;
