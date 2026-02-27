import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Song title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },

    artist: {
        type: String,
        required: [true, 'Artist name is required'],
        trim: true,
        maxlength: [100, 'Artist name cannot exceed 100 characters']
    },

    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    },

    album: {
        type: String,
        trim: true,
        maxlength: [100, 'Album name cannot exceed 100 characters']
    },

    genre: {
        type: String,
        required: [true, 'Genre is required'],
        enum: [
            'Ambient',
            'Techno',
            'Classical',
            'Experimental',
            'Jazz',
            'Vocal',
            'Electronic',
            'Drum & Bass',
            'Minimalist',
            'Dark Ambient',
            'Pop',
            'Rock',
            'Hip Hop',
            'R&B',
            'Folk',
            'Country',
            'Other'
        ]
    },

    audioUrl: {
        type: String,
        required: [true, 'Audio URL is required']
    },

    coverUrl: {
        type: String,
        default: 'https://placehold.co/500/f5f5f5/000?text=Album+Cover'
    },

    audioSize: {
        type: Number
    },

    audioMimeType: {
        type: String
    },

    coverSize: {
        type: Number
    },

    coverMimeType: {
        type: String
    },

    duration: {
        type: Number,  // Duration in seconds
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 second']
    },

    plays: {
        type: Number,
        default: 0,
        min: 0
    },

    likes: {
        type: Number,
        default: 0,
        min: 0
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    cloudinaryAudioId: {
        type: String  // For deletion purposes
    },

    cloudinaryCoverId: {
        type: String  // For deletion purposes
    },

    releaseDate: {
        type: Date,
        default: Date.now
    },

    recordLabel: {
        type: String,
        trim: true
    },

    copyright: {
        type: String,
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for performance
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ genre: 1 });
songSchema.index({ artist: 1 });
songSchema.index({ plays: -1 });
songSchema.index({ createdAt: -1 });
songSchema.index({ uploadedBy: 1 });
songSchema.index({ cloudinaryAudioId: 1 });
songSchema.index({ cloudinaryCoverId: 1 });

// Virtual for formatted duration
songSchema.virtual('formattedDuration').get(function () {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Method to increment play count
songSchema.methods.incrementPlays = async function () {
    this.plays += 1;
    return await this.save();
};

// Method to increment/decrement likes
songSchema.methods.incrementLikes = async function () {
    this.likes += 1;
    return await this.save();
};

songSchema.methods.decrementLikes = async function () {
    if (this.likes > 0) {
        this.likes -= 1;
        return await this.save();
    }
    return this;
};

// Static method to find trending songs
songSchema.statics.findTrending = function (limit = 10) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return this.find({
        isActive: true,
        createdAt: { $gte: weekAgo }
    })
        .sort({ plays: -1, likes: -1 })
        .limit(limit)
        .populate('uploadedBy', 'name');
};

// Static method to find recent songs
songSchema.statics.findRecent = function (limit = 20) {
    return this.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('uploadedBy', 'name');
};

export default mongoose.model('Song', songSchema);
