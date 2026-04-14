import mongoose from 'mongoose';

// Global variable to cache the connection
let cachedConnection = null;

const connectDB = async () => {
    // If we have a cached connection and it's active, use it
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI is not defined");
        
        // Connect and cache the connection
        cachedConnection = await mongoose.connect(uri, { family: 4 });
        console.log(`MongoDB Connected: ${cachedConnection.connection.host}`);
        return cachedConnection;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // In serverless, we shouldn't process.exit(1) as it kills the function instance
        throw error;
    }
};

export default connectDB;
