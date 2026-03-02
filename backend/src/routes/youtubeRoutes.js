import express from 'express';
import { searchYouTube } from '../controllers/youtubeController.js';

const router = express.Router();

router.get('/search', searchYouTube);

export default router;
