import History from '../models/History.js';
import mongoose from 'mongoose';

// @desc    Record a play
// @route   POST /api/history
// @access  Private
export const recordPlay = async (req, res) => {
    const { songId, listenDuration, completionPercentage } = req.body;

    try {
        const history = await History.create({
            userId: req.user._id,
            songId,
            listenDuration,
            completionPercentage,
        });

        res.status(201).json({
            success: true,
            message: 'Play recorded',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's recently played unique songs
// @route   GET /api/history/recent
// @access  Private
export const getRecentHistory = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;

    try {
        const recent = await History.getRecentlyPlayed(req.user._id, limit);
        res.json({ success: true, data: { recent } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's top played songs
// @route   GET /api/history/top
// @access  Private
export const getTopPlayed = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    try {
        const topSongs = await History.getTopSongs(req.user._id, limit, days);
        res.json({ success: true, data: { topSongs } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
