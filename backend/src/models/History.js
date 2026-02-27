import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    },

    playedAt: {
        type: Date,
        default: Date.now
    },

    listenDuration: {
        type: Number,  // Seconds listened
        default: 0
    },

    completionPercentage: {
        type: Number,  // 0-100
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Indexes
historySchema.index({ userId: 1, playedAt: -1 });
historySchema.index({ songId: 1 });
historySchema.index({ playedAt: -1 });

// Static methods
historySchema.statics.getUserHistory = function (userId, limit = 50) {
    return this.find({ userId })
        .sort({ playedAt: -1 })
        .limit(limit)
        .populate('songId', 'title artist album coverUrl duration')
        .select('songId playedAt listenDuration completionPercentage');
};

historySchema.statics.getRecentlyPlayed = async function (userId, limit = 20) {
    return await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $sort: { playedAt: -1 } },
        {
            $group: {
                _id: '$songId',
                lastPlayed: { $first: '$playedAt' },
                playCount: { $sum: 1 }
            }
        },
        { $sort: { lastPlayed: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'songs',
                localField: '_id',
                foreignField: '_id',
                as: 'song'
            }
        },
        { $unwind: '$song' }
    ]);
};

historySchema.statics.getTopSongs = function (userId, limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                playedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$songId',
                playCount: { $sum: 1 },
                totalListenTime: { $sum: '$listenDuration' }
            }
        },
        { $sort: { playCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'songs',
                localField: '_id',
                foreignField: '_id',
                as: 'song'
            }
        },
        { $unwind: '$song' }
    ]);
};

export default mongoose.model('History', historySchema);
