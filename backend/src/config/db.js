import mongoose from 'mongoose';

// Global variable to cache the connection
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI missing");
        
        console.log("Connecting to MongoDB...");
        const conn = await mongoose.connect(uri, { family: 4 });
        console.log(`[DB] Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`[DB] Error: ${error.message}`);
        return null;
    }
};

export default connectDB;
