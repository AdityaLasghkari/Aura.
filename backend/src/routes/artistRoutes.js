import express from 'express';
import { getArtists, checkArtist } from '../controllers/artistController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getArtists);
router.get('/check/:name', protect, admin, checkArtist);

export default router;
