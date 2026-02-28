import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const kindeDomain = process.env.KINDE_DOMAIN || 'https://fallback.kinde.com';

const client = jwksClient({
    jwksUri: `${kindeDomain}/.well-known/jwks.json`,
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (err) return callback(err);
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            jwt.verify(token, getKey, { algorithms: ['RS256'] }, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: 'Not authorized, token failed' });
                }

                req.kindeUser = decoded;
                req.kindeId = decoded.sub;

                // Try to link internal user
                req.user = await User.findOne({ kindeId: decoded.sub }).select('-password');

                next();
            });
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};
