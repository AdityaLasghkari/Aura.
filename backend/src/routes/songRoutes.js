import express from 'express';
import {
    getSongs,
    getSongById,
    uploadSong,
    toggleLikeSong,
    incrementSongPlays,
    getTrendingSongs,
    getRecentSongs,
    getLikedSongs,
    getGoogleDriveStream,
    getImageProxy,
    deleteSong,
} from '../controllers/songController.js';

import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getSongs);
router.get('/trending', getTrendingSongs);
router.get('/recent', getRecentSongs);
router.get('/liked', protect, getLikedSongs);
router.get('/stream/:fileId', getGoogleDriveStream);
router.get('/image/:fileId', getImageProxy);

router.get('/:id', getSongById);

router.post(
    '/',
    protect,
    admin,
    upload.fields([
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
        { name: 'artistPhoto', maxCount: 1 },
    ]),
    uploadSong
);

router.post('/:id/like', protect, toggleLikeSong);
router.post('/:id/play', incrementSongPlays);
router.delete('/:id', protect, admin, deleteSong);

export default router;
