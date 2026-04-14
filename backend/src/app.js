import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import graphRoutes from './routes/graphRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/', (req, res) => res.send('API is running...'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/graphs', graphRoutes);

export default app;
