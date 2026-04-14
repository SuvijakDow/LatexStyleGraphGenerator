import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import graphRoutes from './routes/graphRoutes.js';

dotenv.config();

const app = express();

// 1. Basic Security & Parsing - MUST BE FIRST
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 2. Request Logging - To see what happens
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("DB Middleware Error:", err);
        return res.status(500).json({ message: "Database connection failed" });
    }
});

// Health Check
app.get('/api', (req, res) => res.json({ message: 'API is running...' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/graphs', graphRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.stack);
    res.status(err.status || 500).json({ 
        message: err.message || "An internal server error occurred",
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;
