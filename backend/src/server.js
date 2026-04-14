import app from './app.js';
import connectDB from './config/db.js';

// Global error handlers to capture any async or unexpected crashes
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR (Uncaught):', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('CRITICAL ERROR (Unhandled):', reason);
});

// Initialize database connection
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Ready on port ${PORT}`);
    console.log(`[SERVER] Mode: ${process.env.NODE_ENV || 'development'}`);
});
