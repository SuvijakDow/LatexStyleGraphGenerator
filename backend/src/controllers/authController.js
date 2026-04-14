import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        
        const user = await User.create({ username, password });
        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                username: user.username,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { googleToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        
        let user = await User.findOne({ username: payload.email });
        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-10);
            user = await User.create({ username: payload.email, password: randomPassword });
        }
        res.json({
            _id: user.id,
            username: user.username,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(401).json({ message: 'Google Auth Failed: ' + error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullName, profilePicture } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (fullName !== undefined) user.fullName = fullName;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        await user.save();
        res.json({
            _id: user.id,
            username: user.username,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
