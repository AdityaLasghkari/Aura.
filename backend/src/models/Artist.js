import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Artist name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Artist name cannot exceed 100 characters']
    },
    photoUrl: {
        type: String,
        default: 'https://placehold.co/600/000000/FFF?text=Artist'
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    cloudinaryPhotoId: {
        type: String
    }
}, {
    timestamps: true
});

artistSchema.index({ name: 'text' });

export default mongoose.model('Artist', artistSchema);
