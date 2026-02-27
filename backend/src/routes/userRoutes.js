import express from 'express';
import {
    getCurators,
    getPublicProfile,
    toggleFollow,
    updateUserProfile,
    getUserStats
} from '../controllers/userController.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/curators', getCurators);
router.get('/stats', protect, getUserStats);
router.get('/profile/:id', getPublicProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/follow/:id', protect, toggleFollow);

export default router;
