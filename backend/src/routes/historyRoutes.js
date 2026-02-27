import express from 'express';
import {
    recordPlay,
    getRecentHistory,
    getTopPlayed,
} from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, recordPlay);
router.get('/recent', protect, getRecentHistory);
router.get('/top', protect, getTopPlayed);

export default router;
