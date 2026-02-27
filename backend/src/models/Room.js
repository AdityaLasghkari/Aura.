import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    kings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    currentSong: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    },
    isPlaying: {
        type: Boolean,
        default: false
    },
    currentTime: {
        type: Number,
        default: 0
    },
    queue: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    isCollaborative: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

export default Room;
