import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // Don't include in queries by default
  },

  avatar: {
    type: String,
    default: 'https://placehold.co/200/000000/FFF?text=User'
  },

  bio: {
    type: String,
    maxlength: [160, 'Bio cannot exceed 160 characters'],
    default: ''
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],

  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  isActive: {
    type: Boolean,
    default: true
  },

  lastLogin: {
    type: Date
  }
}, {
  timestamps: true  // createdAt, updatedAt
});

// Indexes for performance
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for liked songs count
userSchema.virtual('likedSongsCount').get(function () {
  return this.likedSongs ? this.likedSongs.length : 0;
});

// Virtual for playlists count
userSchema.virtual('playlistsCount').get(function () {
  return this.playlists ? this.playlists.length : 0;
});

export default mongoose.model('User', userSchema);
