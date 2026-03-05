import express from 'express';
import { searchYouTube, getYouTubePlaylist } from '../controllers/youtubeController.js';

const router = express.Router();

router.get('/search', searchYouTube);
router.get('/playlist', getYouTubePlaylist);

export default router;
