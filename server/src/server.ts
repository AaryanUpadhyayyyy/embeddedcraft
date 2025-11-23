import app from './app';
import { env } from './config/env';
import logger from './utils/logger';
import { connectDB } from './config/database';

const PORT = parseInt(env.PORT, 10);

// Connect to Database then start server
connectDB().then(() => {
    const server = app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });

    // Graceful Shutdown
    const shutdown = () => {
        logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');
        server.close(() => {
            logger.info('Process terminated');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
});
