import mongoose from 'mongoose';
import { env } from './env';
import logger from '../utils/logger';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI || 'mongodb://localhost:27017/embeddedcraft');
        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

    } catch (error: any) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
