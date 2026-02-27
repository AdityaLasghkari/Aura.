import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Playlist name is required'],
        trim: true,
        unique: true,
        maxlength: [50, 'Playlist name cannot exceed 50 characters']
    },

    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],

    isPublic: {
        type: Boolean,
        default: true
    },

    shareCode: {
        type: String,
        unique: true,
        sparse: true
    },

    coverUrl: {
        type: String,
        default: null  // Will use first song's cover or default
    },

    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    tags: [{
        type: String,
        trim: true
    }],

    collaborative: {
        type: Boolean,
        default: false
    },

    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Indexes
playlistSchema.index({ userId: 1 });
playlistSchema.index({ name: 1 }, { unique: true });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ shareCode: 1 });

// Virtual for song count
playlistSchema.virtual('songCount').get(function () {
    return this.songs ? this.songs.length : 0;
});

// Virtual for follower count
playlistSchema.virtual('followerCount').get(function () {
    return this.followers ? this.followers.length : 0;
});

// Virtual for total duration
playlistSchema.virtual('totalDuration').get(function () {
    if (!this.songs || this.songs.length === 0) return 0;
    return this.songs.reduce((total, song) => {
        return total + (song.duration || 0);
    }, 0);
});

// Methods
playlistSchema.methods.addSong = async function (songId) {
    if (!this.songs.includes(songId)) {
        this.songs.push(songId);
        return await this.save();
    }
    return this;
};

playlistSchema.methods.removeSong = async function (songId) {
    this.songs = this.songs.filter(id => id.toString() !== songId.toString());
    return await this.save();
};

playlistSchema.methods.addFollower = async function (userId) {
    if (!this.followers.includes(userId)) {
        this.followers.push(userId);
        return await this.save();
    }
    return this;
};

export default mongoose.model('Playlist', playlistSchema);
