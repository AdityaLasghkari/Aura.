import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                },
                token: generateToken(user._id),
            },
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
        user.lastLogin = Date.now();
        await user.save();

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                },
                token: generateToken(user._id),
            },
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
    if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    likedSongs: user.likedSongs,
                },
            },
        });
    } else {
        res.status(404).json({ message: 'User not found in DB db' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.avatar = req.body.avatar || user.avatar;

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar,
                    role: updatedUser.role,
                },
            },
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Sync Kinde User to DB
// @route   POST /api/auth/sync
// @access  Private
export const syncUser = async (req, res) => {
    const { id: kindeId, name, email, picture } = req.body;

    if (req.kindeId !== kindeId) {
        return res.status(403).json({ message: 'Token mismatch' });
    }

    try {
        let user = await User.findOne({ kindeId });

        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                user.kindeId = kindeId;
                if (picture && user.avatar === 'https://placehold.co/200/000000/FFF?text=User') {
                    user.avatar = picture;
                }
                await user.save();
            } else {
                user = await User.create({
                    kindeId,
                    name,
                    email,
                    avatar: picture || 'https://placehold.co/200/000000/FFF?text=User',
                    password: Math.random().toString(36).slice(-15)
                });
            }
        }

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ message: 'Server error during sync' });
    }
};
