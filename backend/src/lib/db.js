import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 1,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // Exit process with failure
    }
};