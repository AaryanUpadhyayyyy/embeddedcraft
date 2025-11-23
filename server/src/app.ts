import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(','),
    credentials: true,
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images if needed
app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
}));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', version: '1.0.0' });
});

import routes from './routes';

// ...

// Routes
app.use('/v1', routes);

// Error Handling
app.use(errorHandler);

export default app;
