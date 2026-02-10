import mongoose from 'mongoose';
import { envConfig } from '../utils/accessEnv.js';

envConfig;

const connectDB = async () => {
    
    try {
        const url = process.env.MONGODB_URL;
        if (!url) {
            throw new Error('MongoDB connection URL is not defined in environment variables');
        }
        await mongoose.connect(url);
        console.log('MongoDB connected successfully');
    } catch (e) {
        console.error(`mongodb connection ${e}`);
        process.exit(1);
    }
}

export default connectDB;