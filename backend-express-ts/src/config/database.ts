import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const url = process.env.MONGO_URL;
        if (!url) {
            throw new Error('MongoDB connection URL is not defined in environment variables');
        }
        await mongoose.connect(url);
        console.log('MongoDB connected successfully');
    } catch (e) {
        console.error(`mongodb connection error: ${e}`);
        process.exit(1);
    }
}

export default connectDB;