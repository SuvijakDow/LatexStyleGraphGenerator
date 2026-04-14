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
            user = await User.create({ 
                username: payload.email, 
                password: randomPassword,
                fullName: payload.name || '',
                profilePicture: payload.picture || ''
            });
        } else {
            // Sync profile data if it's missing
            let updated = false;
            if (!user.fullName && payload.name) {
                user.fullName = payload.name;
                updated = true;
            }
            if (!user.profilePicture && payload.picture) {
                user.profilePicture = payload.picture;
                updated = true;
            }
            if (updated) await user.save();
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
        console.log("1. Starting updateProfile controller...");
        const { fullName, profilePicture } = req.body;
        console.log(`2. Received Payload: fullName="${fullName}", pfpLength=${profilePicture ? profilePicture.length : 0}`);
        
        if (!req.user || !req.user._id) {
            console.log("3. Error: req.user is missing");
            return res.status(401).json({ message: 'User object missing in request' });
        }

        console.log(`3. Finding user with ID: ${req.user._id}`);
        const user = await User.findById(req.user._id);
        
        if (!user) {
            console.log("4. User not found in DB");
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("4. Updating fields...");
        if (fullName !== undefined) user.fullName = fullName;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        console.log("5. Saving user to MongoDB...");
        await user.save();
        console.log("6. Save successful!");

        const updatedUser = {
            _id: user.id,
            username: user.username,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            token: generateToken(user._id)
        };
        
        console.log("7. Sending response...");
        res.json(updatedUser);
    } catch (error) {
        console.error("!!! CONTROLLER CRASHED:", error);
        res.status(500).json({ message: error.message });
    }
};
