import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import graphRoutes from './routes/graphRoutes.js';

dotenv.config();

const app = express();

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ message: "Database connection failed", error: err.message });
    }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api', (req, res) => res.send('API is running... (Vercel Edition)'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/graphs', graphRoutes);

export default app;
