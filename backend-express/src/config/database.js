import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


const connectDB = async () => {
    try{
        const url = process.env.MONGODB_URL;
        if(!url) {
            throw new Error("MONGODB_URL is not defined in environment variables");
        }
        await mongoose.connect(url);
        console.log("mongodb connected");
    } catch (err) {
        console.error("mongodb connection error:", err);
        process.exit(1);
    }
}

export default connectDB;